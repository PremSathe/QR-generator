// Current selected segment and BS version
let currentSegment = "personal";
let currentBSVersion = "BS4";

// Fetch vehicle models from JSON file
async function fetchVehicleModels() {
  try {
    const response = await fetch("vehicleModels.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    return null;
  }
}

// Initialize the application
async function initApp() {
  const vehicleModels = await fetchVehicleModels();
  if (!vehicleModels) {
    const modelDropdown = document.getElementById("model-dropdown");
    modelDropdown.innerHTML =
      '<p style="padding: 10px; color: #666">Failed to load vehicle data.</p>';
    return;
  }

  // Segment selection handler
  document.querySelectorAll("#segment-dropdown a").forEach((segment) => {
    segment.addEventListener("click", function (e) {
      e.preventDefault();
      currentSegment = this.getAttribute("data-segment");
      updateModelDropdown(currentSegment, currentBSVersion, vehicleModels);

      const dropdownBtn =
        this.closest(".dropdown").querySelector(".dropdown-btn");
      dropdownBtn.innerHTML = "Select Model: " + this.textContent;
      const icon = dropdownBtn.querySelector("i");
      if (!icon) {
        const newIcon = document.createElement("i");
        newIcon.className = "fas fa-chevron-down";
        dropdownBtn.appendChild(newIcon);
      } else {
        dropdownBtn.appendChild(icon);
      }

      this.closest(".dropdown-content").classList.remove("active");
      dropdownBtn.classList.remove("active");
    });
  });

  // Radio button change handler
  document.querySelectorAll('input[name="bs-version"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      currentBSVersion = this.value;
      updateModelDropdown(currentSegment, currentBSVersion, vehicleModels);
    });
  });

  // Initialize with personal segment and BS4 by default
  updateModelDropdown("personal", "BS4", vehicleModels);
}

// Function to update model dropdown
function updateModelDropdown(segment, bsVersion, vehicleModels) {
  const modelDropdown = document.getElementById("model-dropdown");
  modelDropdown.innerHTML = "";

  if (!vehicleModels[segment] || !vehicleModels[segment][bsVersion]) {
    const noModelsMsg = document.createElement("p");
    noModelsMsg.style.padding = "10px";
    noModelsMsg.style.color = "#666";
    noModelsMsg.textContent =
      "No models available for selected segment and BS version";
    modelDropdown.appendChild(noModelsMsg);
    return;
  }

  // Add section title
  const sectionTitle = document.createElement("div");
  sectionTitle.className = "section-title";
  sectionTitle.textContent = `${
    segment.charAt(0).toUpperCase() + segment.slice(1)
  } Vehicles (${bsVersion})`;
  modelDropdown.appendChild(sectionTitle);

  vehicleModels[segment][bsVersion].forEach((vehicle) => {
    if (vehicle.submodels) {
      // Create submenu for vehicles with submodels
      const submenuDiv = document.createElement("div");
      submenuDiv.className = "dropdown-submenu";

      const submenuToggle = document.createElement("a");
      submenuToggle.href = "#";
      submenuToggle.className = "submenu-toggle";
      submenuToggle.textContent = vehicle.name;

      const submenuContent = document.createElement("div");
      submenuContent.className = "submenu-content";

      vehicle.submodels.forEach((submodel) => {
        const submodelLink = document.createElement("a");
        submodelLink.href = "#";
        submodelLink.setAttribute("data-url", submodel.url);
        submodelLink.setAttribute("data-title", submodel.title);
        submodelLink.textContent = submodel.name;
        submenuContent.appendChild(submodelLink);
      });

      submenuDiv.appendChild(submenuToggle);
      submenuDiv.appendChild(submenuContent);
      modelDropdown.appendChild(submenuDiv);
    } else {
      // Create regular link for vehicles without submodels
      const vehicleLink = document.createElement("a");
      vehicleLink.href = "#";
      vehicleLink.setAttribute("data-url", vehicle.url);
      vehicleLink.setAttribute("data-title", vehicle.title);
      vehicleLink.textContent = vehicle.name;
      modelDropdown.appendChild(vehicleLink);
    }
  });

  // Reattach event listeners
  attachModelLinkListeners();
}

// Function to attach click listeners
function attachModelLinkListeners() {
  document.querySelectorAll("#model-dropdown a").forEach((link) => {
    if (!link.classList.contains("submenu-toggle")) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const url = this.getAttribute("data-url");
        const title = this.getAttribute("data-title");

        document.getElementById("qr-title").textContent = title;
        document.getElementById("qr-code").innerHTML = "";
        new QRCode(document.getElementById("qr-code"), {
          text: url,
          width: 200,
          height: 200,
          colorDark: "#000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });

        document.querySelectorAll(".dropdown-content").forEach((content) => {
          content.classList.remove("active");
        });
        document.querySelectorAll(".dropdown-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
        document.querySelectorAll(".dropdown-submenu").forEach((sm) => {
          sm.classList.remove("active");
        });
      });
    }
  });

  document
    .querySelectorAll("#model-dropdown .submenu-toggle")
    .forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const submenu = this.parentElement;
        submenu.classList.toggle("active");

        const dropdownContent = submenu.closest(".dropdown-content");
        if (dropdownContent) {
          dropdownContent
            .querySelectorAll(".dropdown-submenu")
            .forEach((sm) => {
              if (sm !== submenu) {
                sm.classList.remove("active");
              }
            });
        }
      });
    });
}

// Toggle dropdown menus
document.querySelectorAll(".dropdown-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdownContent = button.nextElementSibling;
    dropdownContent.classList.toggle("active");
    button.classList.toggle("active");

    document.querySelectorAll(".dropdown-content").forEach((content) => {
      if (content !== dropdownContent) {
        content.classList.remove("active");
      }
    });
    document.querySelectorAll(".dropdown-btn").forEach((btn) => {
      if (btn !== button) {
        btn.classList.remove("active");
      }
    });
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (
    !e.target.matches(".dropdown-btn") &&
    !e.target.matches(".dropdown-btn *") &&
    !e.target.matches(".dropdown-content a") &&
    !e.target.matches(".dropdown-content a *") &&
    !e.target.matches(".dropdown-submenu") &&
    !e.target.matches(".dropdown-submenu *")
  ) {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.querySelectorAll(".dropdown-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelectorAll(".dropdown-submenu").forEach((sm) => {
      sm.classList.remove("active");
    });
  }
});

// Language dropdown links
document.querySelectorAll(".dropdown-content a[data-url]").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const url = this.getAttribute("data-url");
    const title = this.getAttribute("data-title");

    document.getElementById("qr-title").textContent = title;
    document.getElementById("qr-code").innerHTML = "";
    new QRCode(document.getElementById("qr-code"), {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.querySelectorAll(".dropdown-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
  });
});

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
