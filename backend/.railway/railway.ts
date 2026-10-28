import { defineRailway, project, service } from "railway/iac";

export default defineRailway(() => {
  const backend = service("backend", {
    builder: "dockerfile",
    dockerfilePath: "Dockerfile",
    healthcheck: "/api/health/",
    healthcheckTimeout: 300,
  });
  return project("Grucore", {
    resources: [backend],
  });
});
