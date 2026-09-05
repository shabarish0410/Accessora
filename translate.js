const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(/import \{ useState, useEffect \} from 'react'/, `import { useState, useEffect } from 'react'\nimport { View, Text, TouchableOpacity, Image, ScrollView, TextInput, SafeAreaView, Dimensions, StyleSheet } from 'react-native'`);

// HTML elements
code = code.replace(/<div/g, '<View');
code = code.replace(/<\/div>/g, '</View>');
code = code.replace(/<span/g, '<Text');
code = code.replace(/<\/span>/g, '</Text>');
code = code.replace(/<p/g, '<Text');
code = code.replace(/<\/p>/g, '</Text>');
code = code.replace(/<h1/g, '<Text');
code = code.replace(/<\/h1>/g, '</Text>');
code = code.replace(/<h2/g, '<Text');
code = code.replace(/<\/h2>/g, '</Text>');
code = code.replace(/<button/g, '<TouchableOpacity');
code = code.replace(/<\/button>/g, '</TouchableOpacity>');
code = code.replace(/<input/g, '<TextInput');

// Attributes
code = code.replace(/onClick=/g, 'onPress=');
code = code.replace(/onChange=\{e => (.+?)\(e.target.value\)\}/g, 'onChangeText={$1}');

// img to Image
code = code.replace(/<img([^>]+)src=\{([^}]+)\}([^>]*)>/g, '<Image$1source={{ uri: $2 }}$3>');

// Styles regex replacements (very basic)
code = code.replace(/background:/g, 'backgroundColor:');
code = code.replace(/border: 'none'/g, 'borderWidth: 0');
code = code.replace(/borderBottom: `1px solid \$\{([^}]+)\}`/g, 'borderBottomWidth: 1, borderBottomColor: $1');
code = code.replace(/border: `(\d+)px solid \$\{([^}]+)\}`/g, 'borderWidth: $1, borderColor: $2');
code = code.replace(/border: `3px solid transparent`/g, 'borderWidth: 3, borderColor: "transparent"');
code = code.replace(/cursor: '[^']+',?/g, '');
code = code.replace(/transition: '[^']+',?/g, '');
code = code.replace(/boxShadow: '[^']+',?/g, '');
code = code.replace(/whiteSpace: 'nowrap',?/g, '');
code = code.replace(/textOverflow: 'ellipsis',?/g, '');
code = code.replace(/fontFamily: '[^']+',?/g, '');
code = code.replace(/letterSpacing: \.?\d+,?/g, '');
code = code.replace(/textTransform: '[^']+',?/g, '');
code = code.replace(/display: '(flex|block|inline-flex|grid)',?/g, ''); // RN is always flex
code = code.replace(/gridTemplateColumns: '[^']+',?/g, 'flexDirection: "row", flexWrap: "wrap",'); 
code = code.replace(/flexShrink: 0,?/g, ''); // Default is 0 in RN
code = code.replace(/'100dvh'/g, '"100%"');

// Additional touch ups
code = code.replace(/<TextInput(.*?)(\/>)/g, '<TextInput$1placeholderTextColor="#999"$2');

fs.writeFileSync('src/App.tsx', code);
console.log('Done replacing strings.');
