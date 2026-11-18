"""
Arsitektur model SkindexHybrid v3 (ConvNeXt-Tiny + ViT-B/16).

Disalin persis dari notebook training (skindex-v3-zian-version.ipynb, Cell 4)
supaya nama layer sama dengan checkpoint. Jangan ubah urutan/penamaan layer —
state_dict akan gagal di-load kalau berubah.

Total parameter: 115.073.144 (460 MB fp32).

@format
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models


class FlexibleViT(nn.Module):
    """ViT-B/16 yang selalu menerima input 224x224 (di-resize internal)."""

    def __init__(self) -> None:
        super().__init__()
        vit = models.vit_b_16(weights=None)
        vit.heads = nn.Identity()
        self.vit = vit

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.shape[-2:] != (224, 224):
            x = F.interpolate(x, size=(224, 224), mode="bilinear", align_corners=False)
        return self.vit(x)


class SkindexHybridModel(nn.Module):
    """Dua cabang (ConvNeXt + ViT) → concat 1024-D → MLP head."""

    def __init__(self, num_classes: int = 22) -> None:
        super().__init__()

        # Cabang 1: ConvNeXt-Tiny
        convnext = models.convnext_tiny(weights=None)
        self.convnext_features = convnext.features
        self.convnext_pool = convnext.avgpool
        self.convnext_norm = convnext.classifier[0]
        self.convnext_proj = nn.Linear(768, 512)

        # Cabang 2: ViT-B/16
        self.vit_features = FlexibleViT()
        self.vit_proj = nn.Linear(768, 512)

        # Fusion
        self.fusion_norm = nn.LayerNorm(1024)

        # Classifier head
        self.mlp_head = nn.Sequential(
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.SiLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.SiLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x_conv = self.convnext_features(x)
        x_conv = self.convnext_pool(x_conv)
        x_conv = self.convnext_norm(x_conv)
        x_conv = torch.flatten(x_conv, 1)
        x_conv = self.convnext_proj(x_conv)

        x_vit = self.vit_features(x)
        x_vit = self.vit_proj(x_vit)

        x_fused = torch.cat((x_conv, x_vit), dim=1)
        x_fused = self.fusion_norm(x_fused)

        return self.mlp_head(x_fused)


def load_model(checkpoint_path: str, num_classes: int = 22) -> SkindexHybridModel:
    """Muat bobot model ke CPU dengan aman."""
    model = SkindexHybridModel(num_classes=num_classes)
    # Checkpoint disimpan dari CUDA -> wajib map_location="cpu"
    state = torch.load(checkpoint_path, map_location="cpu")
    model.load_state_dict(state, strict=True)
    model.eval()
    return model
