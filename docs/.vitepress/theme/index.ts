import DefaultTheme from "vitepress/theme-without-fonts";
import {watch} from "vue";
import PlotRender from "../../components/PlotRender.js";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({app, router}) {
    app.component("PlotRender", PlotRender);
    enableAnalytics(router);
  }
};

function enableAnalytics(router) {
  if (typeof location === "undefined" || location.origin !== "https://observablehq.com") return;

  let pageLoaded;
  let queue: any[] | null = [];
  let user;

  watch(router.route, () => {
    if (pageLoaded) {
      emit({
        type: "routeChanged",
        event_version: 2,
        data: {},
        tags: {}
      });
    } else {
      emit({
        type: "pageLoad",
        event_version: 1,
        data: {referrer: document.referrer.replace(/\?.*/, "")},
        tags: {}
      });
      pageLoaded = true;
    }
  });

  fetch("https://api.observablehq.com/user", {credentials: "include"})
    .then((response) => (response.ok ? response.json() : null))
    .then(
      (u) => (user = u),
      () => (user = null)
    )
    .then(() => (sendEvents(queue), (queue = null)));

  function emit(event) {
    event.time = new Date().toISOString();
    event.location = location.href;
    if (queue) queue.push(event);
    else sendEvents([event]);
  }

  function sendEvents(events) {
    navigator.sendBeacon(
      "https://events.observablehq.com/beacon-events",
      JSON.stringify({
        events: events.map((event) => ({...event, user_id: user?.id, user_agent: navigator.userAgent})),
        send_time: new Date().toISOString()
      })
    );
  }
}
