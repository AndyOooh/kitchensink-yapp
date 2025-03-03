"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Flex, SegmentedControl } from "@radix-ui/themes";
import { ApiPlayground } from "./components/ApiPlayground";
import { Leaderboard } from "./components/Leaderboard";
import { StickyTopBox } from "@/components/ui/StickyTopBox";
import { useState } from "react";

const INDEXER_SECTIONS = {
  playground: {
    title: "API Playground",
    component: <ApiPlayground />,
  },
  leaderboard: {
    title: "Leaderboard",
    component: <Leaderboard />,
  },
} as const;

type IndexerSection = keyof typeof INDEXER_SECTIONS;

export default function IndexerPage() {
  const [currentView, setCurrentView] = useState<IndexerSection>("playground");

  return (
    <>
      <StickyTopBox>
        <Flex direction="column" justify="between" align="center" gap="2">
          <PageHeader title="Indexer" backPath="/" />
          <SegmentedControl.Root
            size="1"
            value={currentView}
            onValueChange={(value: IndexerSection) => setCurrentView(value)}
            className="w-full"
          >
            {Object.entries(INDEXER_SECTIONS).map(([key, section]) => (
              <SegmentedControl.Item key={key} value={key}>
                <Flex align="center" gap="2">
                  {section.title}
                </Flex>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </Flex>
      </StickyTopBox>
      {INDEXER_SECTIONS[currentView].component}
    </>
  );
}
