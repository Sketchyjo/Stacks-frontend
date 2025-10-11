# Custom Splash Screen Guide

## Overview
This custom splash screen implementation replaces the default Expo splash screen with a professionally animated, branded experience.

## Features
- ✨ Smooth entrance animations with spring physics
- 🔄 Rotating logo animation
- 📊 Animated loading progress bar
- 🎨 Beautiful gradient background
- ✨ Floating particle effects
- 🎯 Proper timing coordination with app initialization

## Customization Options

### 1. Replace the Logo
Currently using a placeholder "S" logo. To add your actual logo:

```tsx
// In SplashScreen.tsx, replace the logoPlaceholder View with:
<Image
  source={require('../assets/logo.png')}
  style={styles.logo}
  resizeMode="contain"
/>

// Add this to styles:
logo: {
  width: 80,
  height: 80,
},
```

### 2. Change Colors and Gradient
Modify the gradient colors in the LinearGradient component:

```tsx
colors={['#your-color-1', '#your-color-2', '#your-color-3']}
```

### 3. Customize Text
Update the app name and tagline:

```tsx
<Text style={styles.appName}>Your App Name</Text>
<Text style={styles.tagline}>Your tagline here</Text>
```

### 4. Adjust Animation Timing
Fine-tune animation durations in the useEffect:

```tsx
// Entrance animation duration
duration: 800, // milliseconds

// Logo rotation speed
duration: 3000, // milliseconds for full rotation

// Exit delay after app is ready
setTimeout(() => {...}, 800); // milliseconds
```

### 5. Disable Particle Effects
Remove the particles by commenting out the particles container:

```tsx
// {/* Floating Particles Effect (Optional) */}
// <View style={styles.particlesContainer}>
//   ...particle code...
// </View>
```

## Integration with App Loading

The splash screen is integrated with your existing font loading system:

1. Shows immediately when the app starts
2. Waits for fonts to load (`useFonts` hook)
3. Displays loading animation during this time
4. Shows "Ready!" when fonts are loaded
5. Animates out smoothly before showing the main app

## Performance Considerations

- Uses native driver for all animations (smooth 60fps)
- Minimizes component re-renders
- Proper cleanup of animations on unmount
- Efficient particle animation using interpolation

## Accessibility

- Proper status bar styling
- Accessible loading states
- Screen reader friendly text
- Respects system preferences for reduced motion (can be added)

## Troubleshooting

### Splash screen shows too briefly
Increase the minimum display time:
```tsx
setTimeout(() => {...}, 1200); // Increase from 800ms
```

### Animations are jerky
Ensure you're using `useNativeDriver: true` for all animations and avoid animating layout properties.

### App launches slowly
The splash screen will automatically adapt to your app's loading time. No need to set fixed durations.