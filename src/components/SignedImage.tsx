import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator } from 'react-native';
import { VisitorService } from '../services/visitors';
import { C } from '../types';

interface SignedImageProps {
  path: string;
  style?: StyleProp<ImageStyle>;
}

export function SignedImage({ path, style }: SignedImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      if (!path) {
        setLoading(false);
        return;
      }
      
      const resolved = await VisitorService.getPhotoUrl(path);
      if (mounted) {
        setUrl(resolved);
        setLoading(false);
      }
    }
    
    load();
    return () => { mounted = false; };
  }, [path]);

  if (loading) {
    return (
      <View style={[style as any, { justifyContent: 'center', alignItems: 'center', backgroundColor: C.surface }]}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
    );
  }

  if (!url) {
    // Fallback if image fails to load or no path
    return (
      <View style={[style as any, { backgroundColor: C.border }]} />
    );
  }

  return <Image source={{ uri: url }} style={style} />;
}
