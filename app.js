document.addEventListener("DOMContentLoaded", async () => {

  // =========================================================
  // GLOBAL STATE
  // =========================================================

  let authMode = "signin";
  let passwordMode = false;
  let awkwardTimer = null;


  // =========================================================
  // CHARACTER FILES
  // =========================================================

  const characterContainer =
    document.getElementById("character-container");

  const characters = [
    {
      id: "pink-dome-char",
      file: "characters/pink-dome.svg"
    },
    {
      id: "trumpet-char",
      file: "characters/trumpet.svg"
    },
    {
      id: "teal-fluffy-char",
      file: "characters/teal-fluffy.svg"
    },
    {
      id: "blue-circle-char",
      file: "characters/blue-circle.svg"
    }
  ];


  // =========================================================
  // LOAD CHARACTERS
  // =========================================================

  if (characterContainer) {

    characterContainer.innerHTML = "";

    await Promise.all(

      characters.map(async (character) => {

        try {

          const response =
            await fetch(character.file);

          if (!response.ok) {
            throw new Error(
              `Could not load ${character.file}`
            );
          }

          const svgText =
            await response.text();

          const parser =
            new DOMParser();

          const svgDocument =
            parser.parseFromString(
              svgText,
              "image/svg+xml"
            );

          const svg =
            svgDocument.querySelector("svg");

          if (!svg) return;

          svg.removeAttribute("width");
          svg.removeAttribute("height");

          svg.setAttribute(
            "id",
            character.id
          );

          svg.setAttribute(
            "class",
            "character-svg"
          );

          characterContainer.appendChild(
            document.importNode(svg, true)
          );

        } catch (error) {

          console.error(
            "Character loading error:",
            error
          );

        }

      })

    );

    setupEyeTracking();

    setNeutralExpression();
  }


  // =========================================================
  // EYE TRACKING
  // =========================================================

  function setupEyeTracking() {

    const characterSvgs =
      document.querySelectorAll(
        ".character-svg"
      );

    const eyes = [];


    characterSvgs.forEach((svg) => {

      // -----------------------------------------------------
      // PINK DOME
      // -----------------------------------------------------

      if (
        svg.id === "pink-dome-char"
      ) {

        const pupil =
          svg.querySelector("#pupil");

        const eye =
          svg.querySelector("#eye-white");

        if (pupil && eye) {

          pupil.style.transform = "none";

          eyes.push({

            svg: svg,
            pupil: pupil,
            eye: eye,

            originalX: 130,
            originalY: 100,

            strength: 0.55

          });

        }

        return;
      }


      // -----------------------------------------------------
      // OTHER CHARACTERS
      // -----------------------------------------------------

      svg
        .querySelectorAll(
          '[id*="pupil" i]'
        )
        .forEach((pupil) => {

          const id =
            pupil.id.toLowerCase();

          let side = null;

          if (id.includes("left")) {
            side = "left";
          }

          if (id.includes("right")) {
            side = "right";
          }

          if (!side) return;


          const eye =
            svg.querySelector(
              `#eye-white-${side}`
            );

          if (!eye) return;


          pupil.style.transform =
            "none";


          eyes.push({

            svg: svg,

            pupil: pupil,

            eye: eye,

            originalX:
              parseFloat(
                pupil.getAttribute("cx")
              ),

            originalY:
              parseFloat(
                pupil.getAttribute("cy")
              ),

            strength: 1

          });

        });

    });


    let mouseX =
      window.innerWidth / 2;

    let mouseY =
      window.innerHeight / 2;

    let animationFrame = null;


    window.addEventListener(
      "mousemove",
      (event) => {

        mouseX =
          event.clientX;

        mouseY =
          event.clientY;


        if (animationFrame) return;


        animationFrame =
          requestAnimationFrame(() => {

            updateEyes();

            animationFrame = null;

          });

      }
    );


    function updateEyes() {

      // Password mode has its own
      // awkward-eye animation.
      if (passwordMode) return;


      eyes.forEach((data) => {

        const {
          svg,
          pupil,
          eye,
          originalX,
          originalY,
          strength
        } = data;


        pupil.style.transform =
          "none";


        const eyeRect =
          eye.getBoundingClientRect();


        if (
          !eyeRect.width ||
          !eyeRect.height
        ) {
          return;
        }


        const eyeCenterX =
          eyeRect.left +
          eyeRect.width / 2;

        const eyeCenterY =
          eyeRect.top +
          eyeRect.height / 2;


        const dx =
          mouseX -
          eyeCenterX;

        const dy =
          mouseY -
          eyeCenterY;


        const distance =
          Math.hypot(dx, dy);


        if (!distance) return;


        const directionX =
          dx / distance;

        const directionY =
          dy / distance;


        const maxMovement =
          Math.min(
            eyeRect.width,
            eyeRect.height
          ) * 0.22;


        const movement =
          Math.min(
            distance,
            maxMovement
          );


        const svgRect =
          svg.getBoundingClientRect();

        const viewBox =
          svg.viewBox.baseVal;


        if (
          !viewBox ||
          !viewBox.width ||
          !viewBox.height
        ) {
          return;
        }


        const scaleX =
          viewBox.width /
          svgRect.width;

        const scaleY =
          viewBox.height /
          svgRect.height;


        const newX =
          originalX +
          directionX *
          movement *
          scaleX *
          strength;


        const newY =
          originalY +
          directionY *
          movement *
          scaleY *
          strength;


        pupil.setAttribute(
          "cx",
          newX
        );

        pupil.setAttribute(
          "cy",
          newY
        );

      });

    }


    updateEyes();
  }


  // =========================================================
  // HELPER
  // =========================================================

  function createSVGElement(
    type,
    attributes
  ) {

    const element =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        type
      );

    Object.entries(attributes)
      .forEach(([key, value]) => {

        element.setAttribute(
          key,
          value
        );

      });

    return element;
  }


  // =========================================================
  // GET CHARACTERS
  // =========================================================

  function getCharacters() {

    return {

      pink:
        document.getElementById(
          "pink-dome-char"
        ),

      teal:
        document.getElementById(
          "teal-fluffy-char"
        ),

      blue:
        document.getElementById(
          "blue-circle-char"
        ),

      trumpet:
        document.getElementById(
          "trumpet-char"
        )

    };

  }


  // =========================================================
  // STOP AWKWARD ANIMATION
  // =========================================================

  function stopAwkwardMoment() {

    if (awkwardTimer) {

      clearTimeout(
        awkwardTimer
      );

      awkwardTimer = null;

    }

  }


  // =========================================================
  // CLEAR EXPRESSIONS
  // =========================================================

  function clearExpression() {

    stopAwkwardMoment();


    document
      .querySelectorAll(
        ".custom-expression"
      )
      .forEach((element) => {

        element.remove();

      });


    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    [pink, teal, blue, trumpet]
      .forEach((character) => {

        if (!character) return;

        const mouth =
          character.querySelector(
            "#mouth"
          );

        if (mouth) {

          mouth.style.display = "";

        }

      });


    if (pink) {

      pink
        .querySelectorAll(
          '[id^="tooth"]'
        )
        .forEach((tooth) => {

          tooth.style.display = "";

        });

    }


    document
      .querySelectorAll(
        ".character-svg [id*='eye-white']"
      )
      .forEach((eye) => {

        eye.style.transform = "";

      });


    document
      .querySelectorAll(
        ".character-svg [id*='pupil']"
      )
      .forEach((pupil) => {

        pupil.style.transform = "none";

      });

  }


  // =========================================================
  // NEUTRAL EXPRESSION
  // =========================================================

  function setNeutralExpression() {

    passwordMode = false;

    clearExpression();


    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    [pink, teal, blue, trumpet]
      .forEach((character) => {

        if (!character) return;

        const mouth =
          character.querySelector(
            "#mouth"
          );

        if (mouth) {

          mouth.style.display = "none";

        }

      });


    // -------------------------------------------------------
    // PINK NEUTRAL
    // -------------------------------------------------------

    if (pink) {

      pink.appendChild(
        createSVGElement(
          "line",
          {

            id:
              "neutral-pink-mouth",

            class:
              "custom-expression",

            x1: "212",
            y1: "174",

            x2: "228",
            y2: "174",

            stroke: "#541521",

            "stroke-width": "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // -------------------------------------------------------
    // TEAL NEUTRAL
    // -------------------------------------------------------

    if (teal) {

      teal.appendChild(
        createSVGElement(
          "line",
          {

            id:
              "neutral-teal-mouth",

            class:
              "custom-expression",

            x1: "44",
            y1: "96",

            x2: "54",
            y2: "96",

            stroke: "#296a6c",

            "stroke-width": "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // -------------------------------------------------------
    // BLUE NEUTRAL
    // -------------------------------------------------------

    if (blue) {

      blue.appendChild(
        createSVGElement(
          "line",
          {

            id:
              "neutral-blue-mouth",

            class:
              "custom-expression",

            x1: "35",
            y1: "60",

            x2: "45",
            y2: "60",

            stroke: "#10477d",

            "stroke-width": "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // -------------------------------------------------------
    // TRUMPET NEUTRAL
    // -------------------------------------------------------

    if (trumpet) {

      trumpet.appendChild(
        createSVGElement(
          "line",
          {

            id:
              "neutral-trumpet-mouth",

            class:
              "custom-expression",

            x1: "20",
            y1: "54",

            x2: "36",
            y2: "54",

            stroke: "#8a1b32",

            "stroke-width": "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // -------------------------------------------------------
    // RESET PUPILS
    // -------------------------------------------------------

    resetPupils();

  }


  // =========================================================
  // RESET PUPILS
  // =========================================================

  function resetPupils() {

    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    if (pink) {

      const pupil =
        pink.querySelector("#pupil");

      if (pupil) {

        pupil.style.transform = "none";

        pupil.setAttribute(
          "cx",
          "130"
        );

        pupil.setAttribute(
          "cy",
          "100"
        );

      }

    }


    if (teal) {

      const left =
        teal.querySelector(
          "#pupil-left"
        );

      const right =
        teal.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "64"
        );

        left.setAttribute(
          "cy",
          "63"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "86"
        );

        right.setAttribute(
          "cy",
          "63"
        );

      }

    }


    if (blue) {

      const left =
        blue.querySelector(
          "#pupil-left"
        );

      const right =
        blue.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "29"
        );

        left.setAttribute(
          "cy",
          "25"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "47"
        );

        right.setAttribute(
          "cy",
          "25"
        );

      }

    }


    if (trumpet) {

      const left =
        trumpet.querySelector(
          "#pupil-left"
        );

      const right =
        trumpet.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "92"
        );

        left.setAttribute(
          "cy",
          "18"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "112"
        );

        right.setAttribute(
          "cy",
          "18"
        );

      }

    }

  }


  // =========================================================
  // HAPPY EXPRESSION
  // =========================================================

  function happyExpression() {

    passwordMode = false;

    clearExpression();


    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    // PINK

    if (pink) {

      const mouth =
        pink.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      pink.appendChild(
        createSVGElement(
          "path",
          {

            id:
              "happy-pink-mouth",

            class:
              "custom-expression",

            d:
              "M 202 164 Q 220 184 238 164",

            fill: "none",

            stroke:
              "#541521",

            "stroke-width":
              "6",

            "stroke-linecap":
              "round"

          }
        )
      );


      pink
        .querySelectorAll(
          '[id^="tooth"]'
        )
        .forEach((tooth) => {

          tooth.style.display =
            "none";

        });

    }


    // TEAL

    if (teal) {

      const mouth =
        teal.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      teal.appendChild(
        createSVGElement(
          "path",
          {

            id:
              "happy-teal-mouth",

            class:
              "custom-expression",

            d:
              "M 42 94 Q 50 104 58 94",

            fill: "none",

            stroke:
              "#296a6c",

            "stroke-width":
              "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // BLUE

    if (blue) {

      const mouth =
        blue.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      blue.appendChild(
        createSVGElement(
          "path",
          {

            id:
              "happy-blue-mouth",

            class:
              "custom-expression",

            d:
              "M 32 58 Q 40 68 48 58",

            fill: "none",

            stroke:
              "#10477d",

            "stroke-width":
              "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    // TRUMPET

    if (trumpet) {

      const mouth =
        trumpet.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      trumpet.appendChild(
        createSVGElement(
          "path",
          {

            id:
              "happy-trumpet-mouth",

            class:
              "custom-expression",

            d:
              "M 18 52 Q 28 62 38 52",

            fill: "none",

            stroke:
              "#8a1b32",

            "stroke-width":
              "4",

            "stroke-linecap":
              "round"

          }
        )
      );

    }


    document
      .querySelectorAll(
        ".character-svg [id*='eye-white']"
      )
      .forEach((eye) => {

        eye.style.transformBox =
          "fill-box";

        eye.style.transformOrigin =
          "center";

        eye.style.transform =
          "scale(1.06)";

      });

  }


  // =========================================================
  // PASSWORD LOOK AWAY
  // =========================================================

  function makeCharactersLookAway() {

    clearExpression();

    passwordMode = true;


    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    // PINK

    if (pink) {

      const pupil =
        pink.querySelector("#pupil");

      if (pupil) {

        pupil.style.transform = "none";

        pupil.setAttribute(
          "cx",
          "120"
        );

        pupil.setAttribute(
          "cy",
          "112"
        );

      }

    }


    // TEAL

    if (teal) {

      const left =
        teal.querySelector(
          "#pupil-left"
        );

      const right =
        teal.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "56"
        );

        left.setAttribute(
          "cy",
          "69"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "78"
        );

        right.setAttribute(
          "cy",
          "69"
        );

      }

    }


    // BLUE

    if (blue) {

      const left =
        blue.querySelector(
          "#pupil-left"
        );

      const right =
        blue.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "26"
        );

        left.setAttribute(
          "cy",
          "29"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "44"
        );

        right.setAttribute(
          "cy",
          "29"
        );

      }

    }


    // TRUMPET

    if (trumpet) {

      const left =
        trumpet.querySelector(
          "#pupil-left"
        );

      const right =
        trumpet.querySelector(
          "#pupil-right"
        );


      if (left) {

        left.style.transform = "none";

        left.setAttribute(
          "cx",
          "87"
        );

        left.setAttribute(
          "cy",
          "23"
        );

      }


      if (right) {

        right.style.transform = "none";

        right.setAttribute(
          "cx",
          "107"
        );

        right.setAttribute(
          "cy",
          "23"
        );

      }

    }

  }


  // =========================================================
  // AWKWARD LOOKING AT EACH OTHER
  // =========================================================

  function startAwkwardMoment() {

    stopAwkwardMoment();

    let phase = 0;


    function awkwardLook() {

      if (!passwordMode) {
        return;
      }


      phase++;


      const {
        pink,
        teal,
        blue,
        trumpet
      } = getCharacters();


      // -----------------------------------------------------
      // LOOK AT EACH OTHER
      // -----------------------------------------------------

      if (phase % 3 === 1) {

        // Pink → Trumpet

        if (pink) {

          const pupil =
            pink.querySelector(
              "#pupil"
            );

          if (pupil) {

            pupil.style.transform = "none";

            pupil.setAttribute(
              "cx",
              "105"
            );

            pupil.setAttribute(
              "cy",
              "100"
            );

          }

        }


        // Trumpet → Pink

        if (trumpet) {

          const left =
            trumpet.querySelector(
              "#pupil-left"
            );

          const right =
            trumpet.querySelector(
              "#pupil-right"
            );


          if (left) {

            left.style.transform = "none";

            left.setAttribute(
              "cx",
              "96"
            );

          }


          if (right) {

            right.style.transform = "none";

            right.setAttribute(
              "cx",
              "116"
            );

          }

        }


        // Teal → Blue

        if (teal) {

          const left =
            teal.querySelector(
              "#pupil-left"
            );

          const right =
            teal.querySelector(
              "#pupil-right"
            );


          if (left) {

            left.style.transform = "none";

            left.setAttribute(
              "cx",
              "64"
            );

          }


          if (right) {

            right.style.transform = "none";

            right.setAttribute(
              "cx",
              "90"
            );

          }

        }


        // Blue → Teal

        if (blue) {

          const left =
            blue.querySelector(
              "#pupil-left"
            );

          const right =
            blue.querySelector(
              "#pupil-right"
            );


          if (left) {

            left.style.transform = "none";

            left.setAttribute(
              "cx",
              "24"
            );

          }


          if (right) {

            right.style.transform = "none";

            right.setAttribute(
              "cx",
              "42"
            );

          }

        }

      }


      // -----------------------------------------------------
      // LOOK DOWN
      // -----------------------------------------------------

      else if (phase % 3 === 2) {

        if (pink) {

          const pupil =
            pink.querySelector(
              "#pupil"
            );

          if (pupil) {

            pupil.style.transform = "none";

            pupil.setAttribute(
              "cx",
              "120"
            );

            pupil.setAttribute(
              "cy",
              "113"
            );

          }

        }


        if (teal) {

          teal
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cy",
                "70"
              );

            });

        }


        if (blue) {

          blue
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cy",
                "30"
              );

            });

        }


        if (trumpet) {

          trumpet
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cy",
                "24"
              );

            });

        }

      }


      // -----------------------------------------------------
      // LOOK AT EACH OTHER AGAIN
      // -----------------------------------------------------

      else {

        if (pink) {

          const pupil =
            pink.querySelector(
              "#pupil"
            );

          if (pupil) {

            pupil.style.transform = "none";

            pupil.setAttribute(
              "cx",
              "105"
            );

            pupil.setAttribute(
              "cy",
              "100"
            );

          }

        }


        if (trumpet) {

          trumpet
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cx",
                pupil.id.includes("left")
                  ? "96"
                  : "116"
              );

              pupil.setAttribute(
                "cy",
                "18"
              );

            });

        }


        if (teal) {

          teal
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cx",
                pupil.id.includes("left")
                  ? "64"
                  : "90"
              );

              pupil.setAttribute(
                "cy",
                "63"
              );

            });

        }


        if (blue) {

          blue
            .querySelectorAll(
              '[id*="pupil"]'
            )
            .forEach((pupil) => {

              pupil.style.transform =
                "none";

              pupil.setAttribute(
                "cx",
                pupil.id.includes("left")
                  ? "24"
                  : "42"
              );

              pupil.setAttribute(
                "cy",
                "25"
              );

            });

        }

      }


      awkwardTimer =
        setTimeout(
          awkwardLook,
          900 +
          Math.random() * 700
        );

    }


    awkwardLook();

  }


  // =========================================================
  // SHOCKED EXPRESSION
  // =========================================================

  function shockedExpression() {

    passwordMode = false;

    clearExpression();


    const {
      pink,
      teal,
      blue,
      trumpet
    } = getCharacters();


    // PINK

    if (pink) {

      const mouth =
        pink.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      pink.appendChild(
        createSVGElement(
          "ellipse",
          {

            id:
              "shock-pink-mouth",

            class:
              "custom-expression",

            cx: "220",
            cy: "177",

            rx: "16",
            ry: "25",

            fill: "#541521"

          }
        )
      );

    }


    // TEAL

    if (teal) {

      const mouth =
        teal.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      teal.appendChild(
        createSVGElement(
          "ellipse",
          {

            id:
              "shock-teal-mouth",

            class:
              "custom-expression",

            cx: "50",
            cy: "100",

            rx: "9",
            ry: "13",

            fill: "#296a6c"

          }
        )
      );

    }


    // BLUE

    if (blue) {

      const mouth =
        blue.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      blue.appendChild(
        createSVGElement(
          "ellipse",
          {

            id:
              "shock-blue-mouth",

            class:
              "custom-expression",

            cx: "40",
            cy: "60",

            rx: "9",
            ry: "14",

            fill: "#10477d"

          }
        )
      );

    }


    // TRUMPET

    if (trumpet) {

      const mouth =
        trumpet.querySelector(
          "#mouth"
        );

      if (mouth) {
        mouth.style.display = "none";
      }


      trumpet.appendChild(
        createSVGElement(
          "ellipse",
          {

            id:
              "shock-trumpet-mouth",

            class:
              "custom-expression",

            cx: "28",
            cy: "54",

            rx: "17",
            ry: "23",

            fill: "#8a1b32"

          }
        )
      );

    }


    document
      .querySelectorAll(
        ".character-svg [id*='eye-white']"
      )
      .forEach((eye) => {

        eye.style.transformBox =
          "fill-box";

        eye.style.transformOrigin =
          "center";

        eye.style.transform =
          "scale(1.18)";

      });

  }


  // =========================================================
  // EMAIL REACTION
  // =========================================================

  const emailInput =
    document.getElementById("email");


  if (emailInput) {

    emailInput.addEventListener(
      "focus",
      () => {

        passwordMode = false;

        happyExpression();

      }
    );


    emailInput.addEventListener(
      "input",
      () => {

        passwordMode = false;

        happyExpression();

      }
    );

  }


  // =========================================================
  // PASSWORD REACTION
  // =========================================================

  const passwordInput =
    document.getElementById("password");


  if (passwordInput) {

    passwordInput.addEventListener(
      "focus",
      () => {

        passwordMode = true;

        makeCharactersLookAway();

        startAwkwardMoment();

      }
    );


    passwordInput.addEventListener(
      "input",
      () => {

        passwordMode = true;

      }
    );


    passwordInput.addEventListener(
      "blur",
      () => {

        passwordMode = false;

        stopAwkwardMoment();

      }
    );

  }


  // =========================================================
  // PASSWORD SHOW / HIDE
  // =========================================================

  const passwordToggle =
    document.querySelector(
      ".password-toggle"
    );

  const eyeOffIcon =
    document.querySelector(
      ".eye-off"
    );

  const eyeOnIcon =
    document.querySelector(
      ".eye-on"
    );


  if (
    passwordToggle &&
    passwordInput
  ) {

    passwordToggle.addEventListener(
      "click",
      () => {

        const isPassword =
          passwordInput.type ===
          "password";


        passwordInput.type =
          isPassword
            ? "text"
            : "password";


        if (eyeOffIcon) {

          eyeOffIcon.classList.toggle(
            "hidden",
            isPassword
          );

        }


        if (eyeOnIcon) {

          eyeOnIcon.classList.toggle(
            "hidden",
            !isPassword
          );

        }


        passwordInput.focus();

      }
    );

  }


  // =========================================================
  // SIGN IN / LOG IN MODE SWITCH
  // =========================================================

  const signinMode =
    document.getElementById(
      "signin-mode"
    );

  const loginMode =
    document.getElementById(
      "login-mode"
    );

  const authHeading =
    document.getElementById(
      "auth-heading"
    );

  const authSubtext =
    document.getElementById(
      "auth-subtext"
    );

  const authSubmit =
    document.getElementById(
      "auth-submit"
    );

  const confirmPasswordGroup =
    document.getElementById(
      "confirm-password-group"
    );

  const confirmPassword =
    document.getElementById(
      "confirm-password"
    );

  const authFooter =
    document.getElementById(
      "auth-footer"
    );


  // ---------------------------------------------------------
  // FOOTER LINKS
  // ---------------------------------------------------------

  function attachFooterLinks() {

    const footerLogin =
      document.getElementById(
        "footer-login"
      );

    const footerSignin =
      document.getElementById(
        "footer-signin"
      );


    if (footerLogin) {

      footerLogin.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          setAuthMode("login");

        }
      );

    }


    if (footerSignin) {

      footerSignin.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          setAuthMode("signin");

        }
      );

    }

  }


  // ---------------------------------------------------------
  // SET AUTH MODE
  // ---------------------------------------------------------

  function setAuthMode(mode) {

    authMode = mode;


    // =========================================
    // SIGN IN
    // =========================================

    if (mode === "signin") {

      signinMode.classList.add(
        "active"
      );

      loginMode.classList.remove(
        "active"
      );


      authHeading.textContent =
        "Join us!";


      authSubtext.textContent =
        "Create your account to get started";


      confirmPasswordGroup.style.display =
        "flex";


      confirmPassword.required =
        true;


      authSubmit.textContent =
        "Sign in";


      authFooter.innerHTML =
        `Already have an account?
         <a href="#" class="signup-link" id="footer-login">
           Log in
         </a>`;


      attachFooterLinks();


      // Keep characters neutral
      setNeutralExpression();

    }


    // =========================================
    // LOG IN
    // =========================================

    else {

      loginMode.classList.add(
        "active"
      );

      signinMode.classList.remove(
        "active"
      );


      authHeading.textContent =
        "Welcome back!";


      authSubtext.textContent =
        "Please enter your details";


      confirmPasswordGroup.style.display =
        "none";


      confirmPassword.required =
        false;


      confirmPassword.value =
        "";


      authSubmit.textContent =
        "Log in";


      authFooter.innerHTML =
        `Don't have an account?
         <a href="#" class="signup-link" id="footer-signin">
           Sign in
         </a>`;


      attachFooterLinks();


      setNeutralExpression();

    }

  }


  // Top buttons

  if (signinMode) {

    signinMode.addEventListener(
      "click",
      () => {

        setAuthMode("signin");

      }
    );

  }


  if (loginMode) {

    loginMode.addEventListener(
      "click",
      () => {

        setAuthMode("login");

      }
    );

  }


  // =========================================================
  // FORM SUBMISSION
  // =========================================================

  const loginForm =
    document.getElementById(
      "login-form"
    );


  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const email =
          document.getElementById(
            "email"
          ).value.trim();


        const password =
          document.getElementById(
            "password"
          ).value;


        // =====================================
        // SIGN IN
        // =====================================

        if (authMode === "signin") {

          const confirm =
            confirmPassword.value;


          if (!email) {

            return;

          }


          if (!password) {

            return;

          }


          if (password !== confirm) {

            shockedExpression();

            alert(
              "Passwords do not match."
            );

            confirmPassword.focus();

            return;

          }


          console.log(
            "SIGN IN:",
            {
              email,
              password
            }
          );


          /*
            =====================================
            HACKATHON AUTHENTICATION GOES HERE

            Example with Supabase:

            const { data, error } =
              await supabase.auth.signUp({
                email: email,
                password: password
              });

            =====================================
          */


          happyExpression();


          alert(
            "Account created successfully!"
          );


          return;

        }


        // =====================================
        // LOG IN
        // =====================================

        console.log(
          "LOG IN:",
          {
            email,
            password
          }
        );


        /*
          =====================================
          HACKATHON AUTHENTICATION GOES HERE

          Example with Supabase:

          const { data, error } =
            await supabase.auth.signInWithPassword({
              email: email,
              password: password
            });

          =====================================
        */


        // For now, demo wrong-password reaction
        if (
          password.length > 0 &&
          password !== "123456"
        ) {

          shockedExpression();

          authSubmit.textContent =
            "Try again";


          setTimeout(() => {

            authSubmit.textContent =
              "Log in";

          }, 1500);


          return;

        }


        happyExpression();


        authSubmit.disabled =
          true;


        authSubmit.textContent =
          "Logging in...";


        setTimeout(() => {

          alert(
            `Successfully logged in as: ${email}`
          );


          authSubmit.disabled =
            false;


          authSubmit.textContent =
            "Log in";

        }, 1200);

      }
    );

  }


  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const googleButton =
    document.querySelector(
      ".btn-google"
    );


  if (googleButton) {

    googleButton.addEventListener(
      "click",
      () => {

        alert(
          "Redirecting to Google OAuth..."
        );

      }
    );

  }


  // =========================================================
  // DEFAULT = SIGN IN
  // =========================================================

  setAuthMode("signin");

});