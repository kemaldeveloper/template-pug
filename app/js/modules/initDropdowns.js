import { Dropdown } from "bootstrap";

export const initDropdowns = () => {
  const dropdownElementList = document.querySelectorAll(".dropdown-toggle");
  [...dropdownElementList].map((dropdownToggleEl) => new Dropdown(dropdownToggleEl));
};
