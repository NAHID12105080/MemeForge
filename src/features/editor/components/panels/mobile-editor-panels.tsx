"use client";

import { Layers, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LayersPanel } from "@/features/editor/components/panels/layers-panel";
import { PropertiesPanel } from "@/features/editor/components/panels/properties-panel";

// The desktop layout gives Layers and Properties their own fixed side
// columns (see EditorShell). Below `lg` those columns are hidden and this
// renders the same panels inside bottom drawers instead, reachable from the
// top bar.
export function MobileEditorPanels() {
  return (
    <div className="flex items-center gap-0.5 lg:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Layers">
            <Layers className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Layers</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto pb-4">
            <LayersPanel />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Properties">
            <Settings2 className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Properties</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto pb-4">
            <PropertiesPanel />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
