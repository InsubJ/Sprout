import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { HabitLog } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { ScreenState } from "../../src/components/ScreenState";
import { ReflectionInteractions } from "../../src/features/sanctuary/ReflectionInteractions";
import { useServices } from "../../src/providers/ServicesProvider";
import { useTheme } from "../../src/providers/ThemeProvider";
export default function ReflectionDeepLink(){const {id}=useLocalSearchParams<{id:string}>();const {logs}=useServices();const theme=useTheme();const [entry,setEntry]=useState<HabitLog|null|undefined>();useEffect(()=>{if(!logs||!id){setEntry(null);return}void logs.getById(id).then(setEntry).catch(()=>setEntry(null))},[logs,id]);if(entry===undefined)return <ScreenState message="Opening reflection…"/>;if(!entry)return <ScreenState message="This reflection is unavailable or private." error/>;return <View style={[styles.root,{backgroundColor:theme.background}]}><Stack.Screen options={{headerShown:true,title:"Reflection"}}/>{entry.image_url?<Image source={entry.image_url} style={styles.image} contentFit="cover"/>:null}<Text style={[styles.copy,{color:theme.text}]}>{entry.note||"A moment of care."}</Text><Text style={{color:theme.muted}}>{new Date(entry.created_at).toLocaleString()}</Text><ReflectionInteractions logId={entry.id}/></View>}
const styles=StyleSheet.create({root:{flex:1,padding:spacing.xl,gap:spacing.md},image:{width:"100%",height:280,borderRadius:20},copy:{fontSize:18,lineHeight:26}});
