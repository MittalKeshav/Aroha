"use client";

import { Agentation } from "agentation";

export default function AgentationClient() {
  // Only render the Agentation toolbar in development mode, 
  // so it doesn't show up for real users on the deployed version!
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return <Agentation />;
}
