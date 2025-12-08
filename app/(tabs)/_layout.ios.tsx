
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="dashboard" name="dashboard">
        <Icon sf="chart.bar.fill" />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="ai-planner" name="ai-planner">
        <Icon sf="sparkles" />
        <Label>AI Planner</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="info" name="info">
        <Icon sf="info.circle.fill" />
        <Label>Info</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
