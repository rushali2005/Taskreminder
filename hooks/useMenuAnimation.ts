"use client"

import { useState, useRef } from "react"
import { Animated } from "react-native"

export const useMenuAnimation = (screenWidth: number) => {
  const [menuVisible, setMenuVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
    Animated.timing(slideAnim, {
      toValue: menuVisible ? screenWidth : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const closeMenu = () => {
    if (menuVisible) {
      setMenuVisible(false)
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  return { menuVisible, slideAnim, toggleMenu, closeMenu }
}

