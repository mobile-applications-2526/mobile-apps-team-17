import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';
import IdeaCard from '@/components/IdeaCard';
import { supabase } from '@/supabase';
import { Idea } from '@/types';

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('ideas')
        .select('id, subject, description, status, created_at, company_id')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setIdeas(data ?? []);
      }
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <IdeaCard 
            idea={item}
            onComment={() => {
              //todo: navigate to comments screen
              console.log('Comment on idea:', item.id);
            }}
            //todo: implement follow functionality
            onFollow={() => {
              console.log('Follow idea:', item.id);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ideas yet.</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share an idea!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    padding: 20,
  },
});