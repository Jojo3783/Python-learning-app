// first page
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const themeColors = {
    backgroundColor: '#6f56e8', 
};

export default function index() {
    return (
        <SafeAreaView 
            style={{ 
                flex: 1, 
                backgroundColor: themeColors.backgroundColor 
            }}
        />
    );
}