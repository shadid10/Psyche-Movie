document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("video-modal");
  const videoElement = document.getElementById("video");
  const iframeElement = document.getElementById("iframe");
  const closeModal = document.getElementById("close-modal");
  const qualitySelector = document.getElementById("quality-selector");

  let shakaPlayer;

  // Fetch stream data from JSON file
  let streamData = {};
  try {
    const response = await fetch("streams.json");
    streamData = await response.json();
  } catch (error) {
    console.error("Failed to load stream data:", error);
  }

  // Open modal and play video
  document.querySelectorAll(".play-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const channel = button.dataset.channel;
      const stream = streamData[channel];

      if (!stream) {
        console.error("Channel not found in JSON.");
        return;
      }

      modal.style.display = "flex";

      if (stream.type === "dash") {
        showPopup("📢 Stream is Loading. Please wait. The video will start playing automatically.\n       Once the video starts playing, it will not buffer anymore.");

        iframeElement.style.display = "none";
        videoElement.style.display = "block";
        qualitySelector.style.display = "block"; // Show quality selector

        // Load Shaka Player
        if (!shakaPlayer) {
          shakaPlayer = new shaka.Player(videoElement);
        }

        // Configure DRM if available
        if (stream.drm) {
          shakaPlayer.configure({
            drm: {
              clearKeys: {
                [stream.drm.keyId]: stream.drm.key,
              },
            },
          });
        }

        try {
          await shakaPlayer.load(stream.url);
          videoElement.play();

          // Populate the quality selection dropdown
          updateQualityOptions(shakaPlayer);
        } catch (error) {
          console.error("Error loading DASH stream:", error);
        }
      } else if (stream.type === "m3u8") {
        iframeElement.style.display = "none";
        videoElement.style.display = "block";
        qualitySelector.style.display = "none"; // Hide quality selector

        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(stream.url);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play();
          });
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          videoElement.src = stream.url;
          videoElement.play();
        }
      } else if (stream.type === "iframe") {
        videoElement.style.display = "none";
        iframeElement.style.display = "block";
        iframeElement.src = stream.url;
        qualitySelector.style.display = "none"; // Hide quality selector
      }
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    videoElement.pause();
    videoElement.src = "";
    iframeElement.src = "";
  });

  // Function to update video quality options
  function updateQualityOptions(player) {
    if (!player) return;
    qualitySelector.innerHTML = ""; // Clear previous options

    const tracks = player.getVariantTracks();
    const uniqueResolutions = new Set();

    tracks.forEach((track) => {
      if (!uniqueResolutions.has(track.height)) {
        uniqueResolutions.add(track.height);
        const option = document.createElement("option");
        option.value = track.id;
        option.textContent = `${track.height}p`;
        qualitySelector.appendChild(option);
      }
    });

    // Auto option
    const autoOption = document.createElement("option");
    autoOption.value = "auto";
    autoOption.textContent = "Auto";
    qualitySelector.insertBefore(autoOption, qualitySelector.firstChild);
  }

  // Change video quality when user selects a resolution
  qualitySelector.addEventListener("change", () => {
    if (!shakaPlayer) return;
    const selectedQuality = qualitySelector.value;

    if (selectedQuality === "auto") {
      shakaPlayer.configure({ abr: { enabled: true } });
    } else {
      shakaPlayer.configure({ abr: { enabled: false } });

      const tracks = shakaPlayer.getVariantTracks();
      const selectedTrack = tracks.find((track) => track.id == selectedQuality);

      if (selectedTrack) {
        shakaPlayer.selectVariantTrack(selectedTrack, true);
      }
    }
  });

    // Detect Developer Tools Opening
  setInterval(function () {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      document.body.innerHTML = "Developer Tools Detected! Access Denied.";
    }
  }, 1000);

  (function () {
    let devtools = false;
    const element = new Image();
    Object.defineProperty(element, "id", {
      get: function () {
        devtools = true;
        setTimeout(() => {
          document.body.innerHTML = "Access Denied!";
        }, 100);
      },
    });
    console.log("%c", element);
  })();




  (function () {
    console.log("%cSTOP!", "color: red; font-size: 50px; font-weight: bold;");
    console.log(
      "%cDo not attempt to hack this site!",
      "color: black; font-size: 20px;"
    );

    // Disable Console Access
    Object.defineProperty(console, "_commandLineAPI", {
      get: function () {
        throw new Error("Console access is disabled.");
      },
    });

    // Detect Console Open
    let devtools = false;
    const element = new Image();
    Object.defineProperty(element, "id", {
      get: function () {
        devtools = true;
        setTimeout(() => {
          document.body.innerHTML = "Access Denied!";
        }, 100);
      },
    });
    console.log("%c", element);
  })();


  // Tabbed Navigation Code
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // If "view all" tab is clicked
      if (tab.getAttribute("data-target") === "view-all") {
        // Add active class to all tabs
        tabs.forEach((btn) => btn.classList.add("active"));

        // Show all content
        contents.forEach((content) => content.classList.add("active"));
      } else {
        // Remove active class from all tabs
        tabs.forEach((btn) => btn.classList.remove("active"));

        // Add active class to the clicked tab
        tab.classList.add("active");

        // Show the relevant content and hide others
        const target = tab.getAttribute("data-target");
        contents.forEach((content) => {
          content.classList.remove("active");
          if (content.id === target) {
            content.classList.add("active");
          }
        });
      }
    });
  });

  const popup = document.getElementById("popup");

  function showPopup(message, duration = 9000) {
    popup.innerText = message;
    popup.style.display = "block";

    setTimeout(() => {
      popup.style.display = "none";
    }, duration);
  }
});

