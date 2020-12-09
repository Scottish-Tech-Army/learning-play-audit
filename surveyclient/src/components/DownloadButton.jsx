import React, { useState, useEffect } from "react";
import GetAppIcon from "@material-ui/icons/GetApp";

function DownloadButton() {
  const [deferredInstallEvent, setDeferredInstallEvent] = useState(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    const listener = (event) => {
      event.preventDefault();
      setDeferredInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", listener);

    return function cleanup() {
      window.removeEventListener("beforeinstallprompt", listener);
    };
  }, []);

  useEffect(() => {
    const listener = (event) => {
      console.log("PWA install successful");
      setAppInstalled(true);
    };
    window.addEventListener("appinstalled", listener);

    return function cleanup() {
      window.removeEventListener("appinstalled", listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      let displayMode = "browser tab";
      if (navigator.standalone) {
        displayMode = "standalone-ios";
        setAppInstalled(true);
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.log("Running mode: ", displayMode);
    };
    window.addEventListener("DOMContentLoaded", listener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", listener);
    };
  }, []);

  useEffect(() => {
    const innerListener = (evt) => {
      let displayMode = "browser tab";
      if (evt.matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.log("Running mode: ", displayMode);
    };
    const outerListener = () => {
      window
        .matchMedia("(display-mode: standalone)")
        .addListener(innerListener);
    };
    window.addEventListener("DOMContentLoaded", outerListener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", outerListener);
    };
  }, []);

  function handleInstall() {
    if (deferredInstallEvent != null) {
      deferredInstallEvent.prompt();
    }
  }

  if (deferredInstallEvent == null || appInstalled) {
    return null;
  }

  return (
    <button
      aria-haspopup="true"
      aria-label="Install Application"
      onClick={handleInstall}
      className="download-button"
    >
      <GetAppIcon />
      INSTALL
    </button>
  );
}

export default DownloadButton;
