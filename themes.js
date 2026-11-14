(function () {
  var A = [["gold", "ذهبي", "#d6ac52"], ["emerald", "زمردي", "#3fa66b"], ["turq", "فيروزي", "#33b2b8"], ["violet", "بنفسجي", "#8a6fe0"], ["ruby", "ياقوتي", "#d4586a"], ["copper", "نحاسي", "#c9733a"]];
  function draw() {
    var a = window.ixAccent ? ixAccent.get() : "gold", r = window.ixAccent ? ixAccent.getRamadan() : "off";
    $("#th-sw").innerHTML = A.map(function (x) { return '<button type="button" class="fx-s' + (x[0] === a ? " on" : "") + '" data-a="' + x[0] + '"><i style="background:' + x[2] + '"></i>' + x[1] + "</button>"; }).join("");
    $$("#th-rm .fx-tab").forEach(function (b) { b.classList.toggle("on", b.dataset.r === r); });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-a]"); if (a && window.ixAccent) { ixAccent.set(a.dataset.a); draw(); return; }
    var r = e.target.closest("[data-r]"); if (r && window.ixAccent) { ixAccent.setRamadan(r.dataset.r); draw(); }
  });
  draw();
})();
