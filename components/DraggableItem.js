import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';

const DraggableItem = ({ 
  itemType, 
  onDragEnd, 
  disabled = false,
  size = 60 
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const getItemEmoji = () => {
    switch (itemType) {
      case 'carrot':
        return '🥕';
      case 'apple':
        return '🍎';
      case 'berry':
        return '🍓';
      default:
        return '🥕';
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        
        if (onDragEnd) {
          onDragEnd({
            x: gestureState.moveX,
            y: gestureState.moveY,
            itemType,
          });
        }
        
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.item,
        {
          width: size,
          height: size,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={[styles.itemEmoji, { fontSize: size * 0.7 }]}>
        {getItemEmoji()}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  itemEmoji: {
    textAlign: 'center',
  },
});

export default DraggableItem;

