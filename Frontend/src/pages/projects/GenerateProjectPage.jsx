import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectGenerator from "../../components/ProjectGenerator";

export default function GenerateProjectPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    // redirect to signup/login and come back afterward
    navigate("/signup", { state: { from: location } });
    return null;
  }

  return <ProjectGenerator userId={user.id || user._id} />;
}
