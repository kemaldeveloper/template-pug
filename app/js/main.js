import { changeTheme } from "./modules/changeTheme.js";
import { initDropdowns } from "./modules/initDropdowns.js";

window.addEventListener("DOMContentLoaded", function () {
  initDropdowns();
});

changeTheme();
