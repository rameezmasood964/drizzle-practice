import type { Metadata } from "next";
import { ExploreView } from "@/modules/explore/views/explore_view";

export const metadata: Metadata = {
  title: "Explore Bahawalpur - Hostels, Clinics, Food & Services | apnaBwp",
  description:
    "Browse verified local businesses, hostels, doctors, and cafes in Bahawalpur.",
};

export default function ExplorePage() {
  return <ExploreView />;
}

