# Graph Report - Blume  (2026-10-28)

## Corpus Check
- 10 files · ~14,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 333 nodes · 671 edges · 24 communities (12 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Home Screens & Common UI
- Package Config & Scripts
- App Entry & RN Docs
- Navigation & Auth Flow
- Main Tab & Stack Navigators
- Reusable UI Components
- Services & API Layer
- iOS App Bootstrap
- Dev Dependencies
- Runtime Dependencies
- Android Launcher Icons
- Android Application Class
- Android Main Activity
- Date & Format Utils

## God Nodes (most connected - your core abstractions)
1. `React Native` - 29 edges
2. `react` - 24 edges
3. `Colors` - 19 edges
4. `Spacing` - 18 edges
5. `FontSize` - 17 edges
6. `@react-navigation/native-stack` - 13 edges
7. `useAuthStore` - 12 edges
8. `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)` - 12 edges
9. `Button()` - 10 edges
10. `react-native-vector-icons` - 10 edges

## Surprising Connections (you probably didn't know these)
- `MessageBubbleProps` --references--> `ChatMessage`  [EXTRACTED]
  src/components/cards/MessageBubble.tsx → src/types/user.ts
- `DoctorCardProps` --references--> `Doctor`  [EXTRACTED]
  src/components/cards/DoctorCard.tsx → src/types/user.ts
- `LoginScreen()` --calls--> `Button()`  [EXTRACTED]
  src/screens/auth/LoginScreen.tsx → src/components/common/Button.tsx
- `MessageBubble()` --calls--> `formatTime()`  [EXTRACTED]
  src/components/cards/MessageBubble.tsx → src/utils/formatters.ts
- `ChatRoomScreen()` --calls--> `Header()`  [EXTRACTED]
  src/screens/consultation/ChatRoomScreen.tsx → src/components/common/Header.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **iOS Native Dependency Installation Flow** — readme_ruby_bundler, readme_cocoapods, readme_ios [EXTRACTED 1.00]
- **Start Metro Dev Server Workflow** — readme_npm, readme_yarn, readme_metro [EXTRACTED 1.00]
- **Edit App and Refresh Iteration Loop** — src_app, readme_fast_refresh, readme_dev_menu [INFERRED 0.85]

## Communities (24 total, 12 thin omitted)

### Community 0 - "Home Screens & Common UI"
Cohesion: 0.09
Nodes (36): @react-navigation/bottom-tabs, DetectionHistoryCard(), DetectionHistoryCardProps, styles, BG_COLOR, Button(), ButtonProps, ButtonVariant (+28 more)

### Community 1 - "Package Config & Scripts"
Cohesion: 0.05
Nodes (36): config, { getDefaultConfig, mergeConfig }, engines, node, name, private, scripts, android (+28 more)

### Community 2 - "App Entry & RN Docs"
Cohesion: 0.07
Nodes (29): displayName, name, Android, Android Studio, CocoaPods, CocoaPods Getting Started Guide, Getting Started (Environment Setup), @facebook/react-native GitHub Repository (+21 more)

### Community 3 - "Navigation & Auth Flow"
Cohesion: 0.12
Nodes (22): @react-native-async-storage/async-storage, @react-navigation/native, @react-navigation/native-stack, zustand, Input(), AuthNavigator(), Stack, MainTabNavigator() (+14 more)

### Community 4 - "Main Tab & Stack Navigators"
Cohesion: 0.10
Nodes (21): react-native-vision-camera, ConsultationStack, HomeStack, ProfileStack, ScanStack, Tab, TAB_ICONS, MENU_ITEMS (+13 more)

### Community 5 - "Reusable UI Components"
Cohesion: 0.12
Nodes (17): axios, socket.io-client, MessageBubble(), MessageBubbleProps, styles, InputProps, styles, ChatRoomScreen() (+9 more)

### Community 6 - "Services & API Layer"
Cohesion: 0.16
Nodes (15): react-native-safe-area-context, react-native-vector-icons, DoctorCard(), DoctorCardProps, styles, DoctorListScreen(), Props, styles (+7 more)

### Community 7 - "iOS App Bootstrap"
Cohesion: 0.12
Nodes (6): AppDelegate, ReactNativeDelegate, React, React_RCTAppDelegate, ReactAppDependencyProvider, UIKit

### Community 8 - "Dev Dependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @babel/core, @babel/preset-env, @babel/runtime, eslint, jest, prettier, @react-native/babel-preset (+12 more)

### Community 9 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, axios, react, react-native, @react-native-async-storage/async-storage, @react-native/new-app-screen, react-native-safe-area-context, react-native-screens (+7 more)

### Community 10 - "Android Launcher Icons"
Cohesion: 0.15
Nodes (13): ic_launcher.png (mipmap-hdpi), ic_launcher_round.png (mipmap-hdpi), ic_launcher.png (mipmap-mdpi), ic_launcher_round.png (mipmap-mdpi), ic_launcher.png (mipmap-xhdpi), ic_launcher_round.png (mipmap-xhdpi), ic_launcher.png (mipmap-xxhdpi), ic_launcher_round.png (mipmap-xxhdpi) (+5 more)

### Community 13 - "Date & Format Utils"
Cohesion: 0.43
Nodes (5): DateInput, formatChatTime(), formatDate(), formatRelativeTime(), formatTime()

## Ambiguous Edges - Review These
- `Blume Flower Branding Motif (unverified: icon artwork not visually confirmed)` → `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`  [AMBIGUOUS]
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png · relation: conceptually_related_to

## Knowledge Gaps
- **146 isolated node(s):** `Props`, `ButtonProps`, `ButtonVariant`, `CardProps`, `HeaderProps` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 182 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Blume Flower Branding Motif (unverified: icon artwork not visually confirmed)` and `Blume App Launcher Icon Design (single design, square + round, mdpi-xxxhdpi)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `React Native` connect `App Entry & RN Docs` to `Home Screens & Common UI`, `Package Config & Scripts`, `Navigation & Auth Flow`, `Reusable UI Components`, `Services & API Layer`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **What connects `Props`, `ButtonProps`, `ButtonVariant` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home Screens & Common UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0935374149659864 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App Entry & RN Docs` to `Home Screens & Common UI`, `Package Config & Scripts`, `Navigation & Auth Flow`, `Main Tab & Stack Navigators`, `Reusable UI Components`, `Services & API Layer`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `Package Config & Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Config & Scripts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._