(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const inspectorMode = params.get("mode") === "inspector";

  /*
    The NFC tag contains a static URL such as:
    https://YOURUSERNAME.github.io/halloween-tram/?ref=MF-7A42K9

    The inspector phone uses:
    https://YOURUSERNAME.github.io/halloween-tram/?mode=inspector&ref=MF-7A42K9

    Using the same ref parameter makes the reference identical on both phones.
  */
  const reference =
    (params.get("ref") || "MF-7A42K9")
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 18);

  const UK_TIME_ZONE = "Europe/London";

  const services = [
    "Airport",
    "Altrincham",
    "Bury",
    "East Didsbury",
    "Eccles",
    "Rochdale"
  ];

  const offences = [
    "Travelling without a valid travel credential. Disgusting thievery."
  ];

  function getUKDateTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: UK_TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());

    const values = {};
    for (const part of parts) {
      if (part.type !== "literal") values[part.type] = part.value;
    }

    return {
      date: `${values.day}-${values.month}-${values.year}`,
      time: `${values.hour}:${values.minute}:${values.second}`
    };
  }

  function seededIndex(seed, length) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % length;
  }

  function getFareData() {
    return {
      reference,
      fareZone: "Fare Zone 2",
      service: services[seededIndex(reference, services.length)],
      offence: offences[0]
    };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = false;
  }

  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  }

  /* -------------------------
     PASSENGER
     ------------------------- */

  function initPassenger() {
    show("passenger-screen");

    const data = getFareData();

    setText("passenger-ref", data.reference);

    // Capture the real UK date/time when the passenger notice is generated.
    const issued = getUKDateTime();
    setText("passenger-date", issued.date);
    setText("passenger-time", issued.time);

    window.setTimeout(() => {
      hide("passenger-processing");
      show("passenger-result");
    }, 1450);

    const disputeButton = document.getElementById("dispute-button");
    const disputeMessage = document.getElementById("dispute-message");

    disputeButton?.addEventListener("click", () => {
      disputeMessage.textContent =
        "DISPUTE REQUEST REJECTED. Reason: the Inspector has determined that you are, in fact, a menace to society and a plague upon Manchester.";
      disputeMessage.hidden = false;
      disputeButton.disabled = true;
    });
  }

  /* -------------------------
     INSPECTOR
     ------------------------- */

  let inspectionRunning = false;
  let issuedDateTime = null;

  function initInspector() {
    show("inspector-screen");

    const data = getFareData();

    setText("inspector-ref", data.reference);
    setText("result-ref", data.reference);

    const initial = getUKDateTime();
    setText("inspector-date", initial.date);
    setText("inspector-time", initial.time);

    document.getElementById("issue-button")?.addEventListener("click", startInspection);
    document.getElementById("reset-button")?.addEventListener("click", resetTerminal);
  }

  function unlockAudio() {
    // iOS Safari generally requires a user gesture before audio can play.
    // This is called from the ISSUE button handler.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      const ctx = new AudioContextClass();
      return ctx;
    } catch {
      return null;
    }
  }

  function beep(ctx, frequency = 880, duration = 0.07, volume = 0.025) {
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.value = volume;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // Audio is optional; the visual sequence still works.
    }
  }

  function startInspection() {
    if (inspectionRunning) return;

    inspectionRunning = true;
    const button = document.getElementById("issue-button");
    const reset = document.getElementById("reset-button");

    button.disabled = true;
    reset.disabled = true;

    const audio = unlockAudio();
    audio?.resume?.();

    issuedDateTime = getUKDateTime();

    setText("inspector-date", issuedDateTime.date);
    setText("inspector-time", issuedDateTime.time);
    setText("result-date", issuedDateTime.date);
    setText("result-time", issuedDateTime.time);

    setText("system-status", "INSPECTION ACTIVE");
    setText("credential-state", "READING");
    setText("processing-title", "CONTACTLESS DEVICE DETECTED");
    setText("processing-message", "Reading travel credential...");

    hide("result-panel");

    const progress = document.getElementById("progress-bar");
    const counter = document.getElementById("processing-counter");

    // Deliberately kept under five seconds.
    const duration = 4400;
    const start = performance.now();

    beep(audio, 920, 0.06, 0.025);

    function tick(now) {
      const elapsed = now - start;
      const fraction = Math.min(elapsed / duration, 1);

      progress.style.width = `${fraction * 100}%`;
      counter.textContent = (fraction * 4.4).toFixed(1).padStart(4, "0");

      if (elapsed < 850) {
        setText("processing-title", "CONTACTLESS DEVICE DETECTED");
        setText("processing-message", "Reading travel credential...");
        setText("credential-state", "DETECTED");
      } else if (elapsed < 1750) {
        setText("processing-title", "READING TRAVEL CREDENTIAL");
        setText("processing-message", "Checking credential status...");
        setText("credential-state", "VERIFYING");
      } else if (elapsed < 2850) {
        setText("processing-title", "VERIFYING JOURNEY");
        setText("processing-message", "Checking fare zone and journey record...");
        setText("credential-state", "VERIFYING");
      } else if (elapsed < 3600) {
        setText("processing-title", "NO VALID CREDENTIAL FOUND");
        setText("processing-message", "Fare enforcement action required.");
        setText("credential-state", "FAILED");
      } else {
        setText("processing-title", "PENALTY FARE ISSUED");
        setText("processing-message", "Revenue protection action complete.");
        setText("credential-state", "ISSUED");
      }

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        completeInspection(audio);
      }
    }

    requestAnimationFrame(tick);
  }

  function completeInspection(audio) {
    beep(audio, 520, 0.12, 0.03);
    beep(audio, 780, 0.10, 0.025);

    show("result-panel");
    setText("system-status", "SYSTEM READY");
    setText("credential-state", "ISSUED");
    setText("processing-title", "PENALTY FARE ISSUED");
    setText("processing-message", "Revenue protection action complete.");

    const button = document.getElementById("issue-button");
    const reset = document.getElementById("reset-button");

    button.disabled = true;
    reset.disabled = false;

    inspectionRunning = false;
  }

  function resetTerminal() {
    if (inspectionRunning) return;

    hide("result-panel");

    const now = getUKDateTime();
    setText("inspector-date", now.date);
    setText("inspector-time", now.time);

    setText("system-status", "SYSTEM READY");
    setText("credential-state", "STANDBY");
    setText("processing-title", "SYSTEM READY");
    setText("processing-message", "Awaiting inspection command.");
    setText("processing-counter", "00.0");

    const progress = document.getElementById("progress-bar");
    progress.style.width = "0%";

    const button = document.getElementById("issue-button");
    const reset = document.getElementById("reset-button");

    button.disabled = false;
    reset.disabled = true;
  }

  /* -------------------------
     BOOT
     ------------------------- */

  if (inspectorMode) {
    initInspector();
  } else {
    initPassenger();
  }
})();
