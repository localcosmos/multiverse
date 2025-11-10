import type { TemplateContentNavigation } from 'localcosmos-client';
import type { TemplateContentNavigationEntry } from "localcosmos-client";
import type { Component } from 'vue';

export type BottomNavigationEntry = TemplateContentNavigationEntry;
export type BottomNavigationStack = BottomNavigationEntry[];

export type NavigationButton = {
  genericContent: string,
  icon: Component,
  text: string,
  routeName:string|null,
  route: string | null,
  routeParams?: Record<string, string>,
  hasSubmenu: boolean,
  submenuContent?: TemplateContentNavigation,
  stackedButtons? : NavigationButton[],
}

export type Navigations = Record<string, NavigationButton[]>;

export type TabButtonDefinition = {
  tabIndex : number,
  text: string,
  icon?: Component | null,
  searchMode?: boolean,
}