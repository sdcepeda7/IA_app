import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import MainTool from "./components/MainTool";

const App: React.FC = () => {
  const [showApp, setShowApp] = useState<boolean>(false);

  if (showApp) {
    return <MainTool />;
  }

  return <LandingPage onStart={() => setShowApp(true)} />;
};

export default App;
