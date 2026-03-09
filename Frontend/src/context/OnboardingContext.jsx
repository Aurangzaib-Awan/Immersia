import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";

const OnboardingContext = createContext(null);

export function OnboardingProvider() {
  const [onboardingData, setOnboardingData] = useState({
    selectedCareer: "",
    knownTopics: [],
    unknownTopics: [],
    learningStyle: "",
  });

  const updateOnboarding = (fields) => {
    setOnboardingData(prev => ({ ...prev, ...fields }));
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboarding }}>
      <Outlet />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}