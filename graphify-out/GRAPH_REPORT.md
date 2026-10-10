# Graph Report - Blume  (2026-10-10)

## Corpus Check
- 36 files · ~14,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 691 edges · 22 communities (10 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Navigation & Auth Flow
- Reusable UI Components
- Package Config & Scripts
- App Entry & RN Docs
- Home Screens & Common UI
- Services & API Layer
- iOS App Bootstrap
- Dev Dependencies
- Runtime Dependencies
- Android Launcher Icons
- Android Application Class
- Android Main Activity

## God Nodes (most connected - your core abstractions)
1. `React Native` - 36 edges
2. `react` - 24 edges
3. `Colors` - 19 edges
4. `Spacing` - 18 edges
5. `FontSize` - 17 edges
6. `Button()` - 15 edges
7. `useAuthStore` - 15 edges
8. `@react-navigation/native-stack` - 13 edges
9. `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)` - 12 edges
10. `Card()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ic_launcher.png (mipmap-hdpi)` --implements--> `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [EXTRACTED]
  android/app/src/main/res/mipmap-hdpi/ic_launcher.png → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
- `ic_launcher_round.png (mipmap-hdpi)` --implements--> `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [EXTRACTED]
  android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
- `ic_launcher.png (mipmap-mdpi)` --implements--> `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [EXTRACTED]
  android/app/src/main/res/mipmap-mdpi/ic_launcher.png → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
- `ic_launcher_round.png (mipmap-mdpi)` --implements--> `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [EXTRACTED]
  android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
- `ic_launcher.png (mipmap-xhdpi)` --implements--> `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [EXTRACTED]
  android/app/src/main/res/mipmap-xhdpi/ic_launcher.png → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **iOS Native Dependency Installation Flow** — readme_ruby_bundler, readme_cocoapods, readme_ios [EXTRACTED 1.00]
- **Start Metro Dev Server Workflow** — readme_npm, readme_yarn, readme_metro [EXTRACTED 1.00]
- **Edit App and Refresh Iteration Loop** — src_app, readme_fast_refresh, readme_dev_menu [INFERRED 0.85]

## Communities (22 total, 12 thin omitted)

### Community 0 - "Navigation & Auth Flow"
Cohesion: 0.07
Nodes (39): react-native-vision-camera, @react-navigation/native, @react-navigation/native-stack, Button(), Input(), AuthNavigator(), Stack, ConsultationStack (+31 more)

### Community 1 - "Reusable UI Components"
Cohesion: 0.11
Nodes (30): react, react-native-vector-icons, socket.io-client, styles, styles, MessageBubble(), MessageBubbleProps, styles (+22 more)

### Community 2 - "Package Config & Scripts"
Cohesion: 0.05
Nodes (36): config, { getDefaultConfig, mergeConfig }, engines, node, name, private, scripts, android (+28 more)

### Community 3 - "App Entry & RN Docs"
Cohesion: 0.06
Nodes (31): displayName, name, react-test-renderer, Android, Android Studio, CocoaPods, CocoaPods Getting Started Guide, Getting Started (Environment Setup) (+23 more)

### Community 4 - "Home Screens & Common UI"
Cohesion: 0.11
Nodes (27): @react-navigation/bottom-tabs, DetectionHistoryCard(), DetectionHistoryCardProps, Card(), Header(), LoadingSpinner(), LoadingSpinnerProps, styles (+19 more)

### Community 5 - "Services & API Layer"
Cohesion: 0.12
Nodes (19): axios, @react-native-async-storage/async-storage, zustand, DoctorCard(), DoctorCardProps, DoctorListScreen(), Props, styles (+11 more)

### Community 6 - "iOS App Bootstrap"
Cohesion: 0.12
Nodes (6): AppDelegate, ReactNativeDelegate, React, React_RCTAppDelegate, ReactAppDependencyProvider, UIKit

### Community 7 - "Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @babel/core, @babel/preset-env, @babel/runtime, eslint, jest, prettier, @react-native/babel-preset (+11 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, axios, react, react-native, @react-native-async-storage/async-storage, @react-native/new-app-screen, react-native-safe-area-context, react-native-screens (+7 more)

### Community 9 - "Android Launcher Icons"
Cohesion: 0.15
Nodes (13): ic_launcher.png (mipmap-hdpi), ic_launcher_round.png (mipmap-hdpi), ic_launcher.png (mipmap-mdpi), ic_launcher_round.png (mipmap-mdpi), ic_launcher.png (mipmap-xhdpi), ic_launcher_round.png (mipmap-xhdpi), ic_launcher.png (mipmap-xxhdpi), ic_launcher_round.png (mipmap-xxhdpi) (+5 more)

## Ambiguous Edges - Review These
- `Blume Flower Branding Motif (unverified: icon artwork not visually confirmed)` → `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [AMBIGUOUS]
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png · relation: conceptually_related_to

## Knowledge Gaps
- **146 isolated node(s):** `React`, `React_RCTAppDelegate`, `ReactAppDependencyProvider`, `UIKit`, `exclude` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 182 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Blume Flower Branding Motif (unverified: icon artwork not visually confirmed)` and `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `React Native` connect `App Entry & RN Docs` to `Navigation & Auth Flow`, `Reusable UI Components`, `Package Config & Scripts`, `Home Screens & Common UI`, `Services & API Layer`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **What connects `React`, `React_RCTAppDelegate`, `ReactAppDependencyProvider` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Navigation & Auth Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Reusable UI Components` to `Navigation & Auth Flow`, `Package Config & Scripts`, `App Entry & RN Docs`, `Home Screens & Common UI`, `Services & API Layer`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `Reusable UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.10685249709639953 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Config & Scripts`, `App Entry & RN Docs`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._