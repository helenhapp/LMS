// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// 🚀 MAIN APPLICATION MODULE
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
(() => {
  "use strict";

  // -----------------------------------------
  // 🎨 1. THEME & APPEARANCE MANAGER
  // -----------------------------------------
  class ThemeManager {
    constructor() {
      this.themeCheckbox = document.getElementById("theme-checkbox");
      this.hljsThemeLink = document.getElementById("hljs-theme");
      this.currentTheme = localStorage.getItem("lms_theme") || "light";

      this.init();
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.applyDyslexiaMode();

      if (this.themeCheckbox) {
        this.themeCheckbox.addEventListener("change", (e) => {
          this.applyTheme(e.target.checked ? "dark" : "light");
        });
      }
    }

    applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("lms_theme", theme);

      if (theme === "dark") {
        if (this.themeCheckbox) this.themeCheckbox.checked = true;
        if (this.hljsThemeLink)
          this.hljsThemeLink.href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
      } else {
        if (this.themeCheckbox) this.themeCheckbox.checked = false;
        if (this.hljsThemeLink)
          this.hljsThemeLink.href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
      }
    }

    applyDyslexiaMode() {
      if (localStorage.getItem("lms_dyslexiaMode") === "true") {
        document.body.classList.add("dyslexia-mode");
      }
    }

    toggleDyslexiaMode(btn) {
      const isNowDyslexic = document.body.classList.toggle("dyslexia-mode");
      localStorage.setItem("lms_dyslexiaMode", isNowDyslexic);
      btn.style.transform = "scale(0.85)";
      setTimeout(() => (btn.style.transform = ""), 150);
    }
  }

  // -----------------------------------------
  // 🧩 2. UI & INTERACTION MANAGER
  // -----------------------------------------
  class UIManager {
    constructor() {
      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.navContainer = document.getElementById("nav-container");
      this.scrollToTopBtn = document.getElementById("scrollToTopBtn");
      this.isAnimatingTab = false;

      this.init();
    }

    init() {
      this.generateTOC();
      this.initTabs();
      this.initAccordions();
      this.initMediaZoom();

      // Page visibility transitions
      document.fonts.ready.then(() => document.body.classList.add("is-loaded"));
      window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
          document.body.classList.remove("is-leaving");
          document.body.classList.add("is-loaded");
        }
      });
    }

    generateTOC() {
      const contentBlocks = document.querySelectorAll(
        ".accordion__content, .lesson-content",
      );

      contentBlocks.forEach((block) => {
        const headers = block.querySelectorAll("h3[id]");
        if (headers.length === 0) return;

        const tocBox = document.createElement("div");
        tocBox.className = "toc-box";

        const tocTitle = document.createElement("h4");
        tocTitle.className = "toc-title";
        tocTitle.textContent = "Навігація";
        tocBox.appendChild(tocTitle);

        const nav = document.createElement("nav");
        nav.className = "subsection-nav";
        const ul = document.createElement("ul");

        headers.forEach((header) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "#" + header.id;
          a.textContent = header.textContent.trim();
          li.appendChild(a);
          ul.appendChild(li);
        });

        nav.appendChild(ul);
        tocBox.appendChild(nav);

        const firstHeader = headers[0];
        firstHeader.parentNode.insertBefore(tocBox, firstHeader);
        const separator = document.createElement("hr");
        tocBox.parentNode.insertBefore(separator, tocBox.nextSibling);
      });
    }

    initTabs() {
      const tabButtons = document.querySelectorAll(".tab-btn");
      const savedTabId = sessionStorage.getItem("activeTab");

      if (savedTabId) {
        const savedBtn = document.querySelector(
          `.tab-btn[data-target="${savedTabId}"]`,
        );
        const savedContent = document.getElementById(savedTabId);

        if (savedBtn && savedContent) {
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          document
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active", "show"));
          savedBtn.classList.add("active");
          savedContent.classList.add("active", "show");
        }
      } else {
        const initialActive = document.querySelector(".tab-content.active");
        if (initialActive) initialActive.classList.add("show");
      }

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => this.switchTab(button));
      });
    }

    switchTab(button) {
      if (button.classList.contains("active") || this.isAnimatingTab) return;
      this.isAnimatingTab = true;

      const targetId = button.getAttribute("data-target");
      sessionStorage.setItem("activeTab", targetId);

      const currentActiveContent = document.querySelector(
        ".tab-content.active",
      );
      const currentActiveBtn = document.querySelector(".tab-btn.active");

      if (currentActiveBtn) currentActiveBtn.classList.remove("active");
      button.classList.add("active");

      if (currentActiveContent) {
        currentActiveContent.classList.remove("show");
        setTimeout(() => {
          currentActiveContent.classList.remove("active");
          this.showNewTab(targetId);
        }, 400);
      } else {
        this.showNewTab(targetId);
      }
    }

    showNewTab(targetId) {
      const newContent = document.getElementById(targetId);
      newContent.classList.add("active");
      setTimeout(() => {
        newContent.classList.add("show");
        this.isAnimatingTab = false;
      }, 20);
    }

    initAccordions() {
      const allDetails = document.querySelectorAll("details");
      const savedState = sessionStorage.getItem("openAccordions");

      if (savedState) {
        const openIndices = JSON.parse(savedState);
        allDetails.forEach((detail, index) => {
          if (openIndices.includes(index)) detail.setAttribute("open", "");
          else detail.removeAttribute("open");
        });
      }

      allDetails.forEach((detail) => {
        detail.addEventListener("toggle", () => {
          const openIndices = [];
          allDetails.forEach((d, i) => {
            if (d.hasAttribute("open")) openIndices.push(i);
          });
          sessionStorage.setItem("openAccordions", JSON.stringify(openIndices));

          if (
            detail.open &&
            (detail.classList.contains("accordion__item") ||
              detail.classList.contains("task"))
          ) {
            setTimeout(() => {
              const y =
                detail.getBoundingClientRect().top + window.scrollY - 75;
              window.scrollTo({ top: y, behavior: "smooth" });
            }, 400);
          }
        });
      });
    }

    initMediaZoom() {
      // Images
      const zoomableImages = document.querySelectorAll("img.zoomable");
      const imgKey = "lms_expanded_img_" + this.pageId;
      const savedImages = JSON.parse(sessionStorage.getItem(imgKey) || "[]");

      zoomableImages.forEach((img, index) => {
        if (savedImages.includes(index)) img.classList.add("expanded");
        img.addEventListener("click", () => {
          img.classList.toggle("expanded");
          const openIndices = Array.from(zoomableImages)
            .map((img, i) => (img.classList.contains("expanded") ? i : null))
            .filter((i) => i !== null);
          sessionStorage.setItem(imgKey, JSON.stringify(openIndices));
        });
      });

      // Videos
      const zoomableVideos = document.querySelectorAll(
        ".video-wrapper.zoomable",
      );
      const vidKey = "lms_expanded_vid_" + this.pageId;
      const savedVideos = JSON.parse(sessionStorage.getItem(vidKey) || "[]");

      zoomableVideos.forEach((wrapper, index) => {
        const zoomBtn = document.createElement("button");
        zoomBtn.className = "video-zoom-btn";

        const isExpanded = savedVideos.includes(index);
        if (isExpanded) wrapper.classList.add("expanded");

        zoomBtn.innerHTML = isExpanded ? "✖ Зменшити" : "⛶ Збільшити";
        zoomBtn.title = isExpanded
          ? "Повернути стандартний розмір"
          : "Збільшити відео";
        wrapper.appendChild(zoomBtn);

        zoomBtn.addEventListener("click", () => {
          wrapper.classList.toggle("expanded");
          const nowExpanded = wrapper.classList.contains("expanded");
          zoomBtn.innerHTML = nowExpanded ? "✖ Зменшити" : "⛶ Збільшити";
          zoomBtn.title = nowExpanded
            ? "Повернути стандартний розмір"
            : "Збільшити відео";

          const openIndices = Array.from(zoomableVideos)
            .map((vid, i) => (vid.classList.contains("expanded") ? i : null))
            .filter((i) => i !== null);
          sessionStorage.setItem(vidKey, JSON.stringify(openIndices));
        });
      });
    }

    handleScroll() {
      const scrollY = window.scrollY;

      // Top Nav Shadow
      if (this.navContainer) {
        if (scrollY > 10) this.navContainer.classList.add("scrolled");
        else this.navContainer.classList.remove("scrolled");
      }

      // Scroll To Top Btn
      if (this.scrollToTopBtn) {
        if (scrollY > 300) this.scrollToTopBtn.classList.add("show");
        else this.scrollToTopBtn.classList.remove("show");
      }
    }

    async handleDownloadClick(link) {
      const originalText = link.innerHTML;
      const fileUrl = link.href;

      try {
        link.style.opacity = "0.6";
        link.style.pointerEvents = "none";
        const response = await fetch(fileUrl, { method: "HEAD" });

        if (response.ok) {
          const tempLink = document.createElement("a");
          tempLink.href = fileUrl;
          tempLink.download = link.getAttribute("download") || "";
          tempLink.setAttribute("data-temp", "true");
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
        } else {
          link.textContent = "❌ Файл не знайдено";
          link.style.borderColor = "tomato";
          link.style.color = "tomato";
          link.style.justifyContent = "center";
          setTimeout(() => {
            link.innerHTML = originalText;
            link.style.borderColor = "";
            link.style.color = "";
            link.style.justifyContent = "";
          }, 1000);
        }
      } catch (error) {
        link.textContent = "⚠️ Помилка з'єднання";
        link.style.justifyContent = "center";
        setTimeout(() => {
          link.innerHTML = originalText;
          link.style.justifyContent = "";
        }, 3000);
      } finally {
        link.style.opacity = "1";
        link.style.pointerEvents = "auto";
      }
    }
  }

  // -----------------------------------------
  // 💻 3. CODE & EDITOR MANAGER
  // -----------------------------------------
  class CodeManager {
    constructor() {
      this.init();
    }

    init() {
      this.initHighlightJS();
      this.initCopyButtons();
      this.initCodeMirror();
    }

    initHighlightJS() {
      if (typeof hljs !== "undefined") {
        hljs.highlightAll();
        if (typeof hljs.initLineNumbersOnLoad === "function") {
          hljs.initLineNumbersOnLoad({ singleLine: true });
        }
      }
    }

    initCopyButtons() {
      document.querySelectorAll("pre code").forEach((codeBlock) => {
        if (
          codeBlock.classList.contains("nocopy") ||
          codeBlock.hasAttribute("nocopy")
        )
          return;

        const pre = codeBlock.parentNode;
        const wrapper = document.createElement("div");
        wrapper.className = "code-wrapper";

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Копіювати";
        wrapper.appendChild(copyBtn);

        copyBtn.addEventListener("click", () => {
          const codeLines = codeBlock.querySelectorAll(".hljs-ln-code");
          let textToCopy =
            codeLines.length > 0
              ? Array.from(codeLines)
                  .map((td) => td.textContent)
                  .join("\n")
              : codeBlock.textContent;

          textToCopy = textToCopy.replace(/\u00A0/g, " ");

          navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = "Скопійовано";
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyBtn.textContent = "Копіювати";
              copyBtn.classList.remove("copied");
            }, 2000);
          });
        });
      });
    }

    initCodeMirror() {
      if (typeof CodeMirror === "undefined") return;

      const editors = document.querySelectorAll(".custom-editor-wrapper");
      const pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");

      editors.forEach((wrapper) => {
        const codeInput = wrapper.querySelector(".custom-editor-input");
        const runBtn = wrapper.querySelector(".run-btn");
        const resetBtn = wrapper.querySelector(".reset-btn");

        // Determine what type of editor this is
        const isHtmlEditor = wrapper.classList.contains("html-editor-wrapper");
        const isPythonEditor = wrapper.classList.contains(
          "python-editor-wrapper",
        );

        // Set CodeMirror mode accordingly
        let editorMode = "javascript";
        if (isHtmlEditor) editorMode = "htmlmixed";
        if (isPythonEditor) editorMode = "python";

        const editorId =
          wrapper.id || "editor-" + Math.random().toString(36).substr(2, 9);
        const storageKey = "lms_code_" + pageId + "_" + editorId;

        const savedCode = localStorage.getItem(storageKey);
        if (savedCode !== null) codeInput.value = savedCode;

        const cm = CodeMirror.fromTextArea(codeInput, {
          mode: editorMode,
          theme: "dracula",
          lineNumbers: true,
          tabSize: 4, // Python uses 4 spaces!
          lineWrapping: true,
          viewportMargin: Infinity,
          extraKeys: {
            Tab: (cm) =>
              cm.replaceSelection(
                Array(cm.getOption("indentUnit") + 1).join(" "),
              ),
          },
        });

        cm.on("change", () => localStorage.setItem(storageKey, cm.getValue()));

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setTimeout(() => cm.refresh(), 20);
          });
        });
        observer.observe(wrapper);

        const outputDisplay = wrapper.querySelector(".custom-editor-output");
        const iframeOutput = wrapper.querySelector(".html-editor-output");
        const turtleCanvas = wrapper.querySelector("#turtle-canvas-target");

        if (isHtmlEditor && iframeOutput) iframeOutput.srcdoc = cm.getValue();

        if (runBtn) {
          runBtn.addEventListener("click", () => {
            // Захист від подвійного кліку
            if (runBtn.disabled) return;

            const code = cm.getValue();

            if (isHtmlEditor && iframeOutput) {
              iframeOutput.srcdoc = code;
            } else if (isPythonEditor && outputDisplay) {
              runBtn.disabled = true; // Блокуємо кнопку
              runBtn.style.opacity = "0.5";

              outputDisplay.textContent = "Запуск Python...\n";

              this.runPythonCode(code, outputDisplay).finally(() => {
                runBtn.disabled = false; // Розблоковуємо кнопку
                runBtn.style.opacity = "1";
              });
            } else if (outputDisplay) {
              outputDisplay.textContent = "Запуск JS...\n";
              setTimeout(() => this.runJsCode(code, outputDisplay), 50);
            }
          });
        }

        if (resetBtn) {
          const initialValue = codeInput.defaultValue;
          resetBtn.addEventListener("click", () => {
            cm.setValue(initialValue);
            if (isHtmlEditor && iframeOutput)
              iframeOutput.srcdoc = initialValue;
            if (outputDisplay)
              outputDisplay.textContent = "Очікування запуску...";
          });
        }
      });
    }

    // Runs Python Console with input() support
    runPythonCode(codeToRun, outputDisplay) {
      outputDisplay.textContent = ""; // Clear console

      Sk.configure({
        // 1. Handles print() statements
        output: function (text) {
          outputDisplay.appendChild(document.createTextNode(text));
        },
        // 2. Handles internal Python files
        read: function (x) {
          if (
            Sk.builtinFiles === undefined ||
            Sk.builtinFiles["files"][x] === undefined
          ) {
            throw "File not found: '" + x + "'";
          }
          return Sk.builtinFiles["files"][x];
        },
        // 3. Handles input() statements dynamically!
        inputfun: function (prompt) {
          return new Promise((resolve) => {
            // Print the prompt text (e.g., "What is your name?")
            outputDisplay.appendChild(document.createTextNode(prompt));

            // Create an interactive text field directly in the console
            const inputField = document.createElement("input");
            inputField.type = "text";

            // Style it to look like a glowing terminal cursor
            inputField.style.background = "transparent";
            inputField.style.border = "none";
            inputField.style.borderBottom = "2px solid var(--accent-pop)";
            inputField.style.color = "var(--accent-pop)";
            inputField.style.outline = "none";
            inputField.style.fontFamily = "inherit";
            inputField.style.fontSize = "inherit";
            inputField.style.width = "50%";
            inputField.style.marginLeft = "5px";

            outputDisplay.appendChild(inputField);
            inputField.focus();

            // Wait for the student to press "Enter"
            inputField.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                const val = inputField.value;
                inputField.remove(); // Remove the input box
                outputDisplay.appendChild(document.createTextNode(val + "\n")); // Convert their typing to plain text
                resolve(val); // Send the value back into Python
              }
            });
          });
        },
      });

      // Run the code asynchronously
      const myPromise = Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, codeToRun, true);
      });

      myPromise.then(
        () => {
          if (outputDisplay.textContent === "") {
            outputDisplay.textContent =
              "Код виконано успішно (немає виводу в консоль).";
          }
        },
        (error) => {
          outputDisplay.appendChild(
            document.createTextNode("\nПомилка: " + error.toString()),
          );
        },
      );

      return myPromise;
    }

    runJsCode(codeToRun, outputDisplay) {
      let simulatedOutput = "";
      const originalLog = console.log;
      const originalError = console.error;

      const formatOutput = (args) =>
        args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
          )
          .join(" ") + "\n";

      console.log = (...args) => (simulatedOutput += formatOutput(args));
      console.error = (...args) =>
        (simulatedOutput += "Помилка: " + formatOutput(args));

      try {
        new Function(codeToRun)();
        outputDisplay.textContent =
          simulatedOutput.trim() || "Код виконано (немає виводу в консоль)";
      } catch (error) {
        outputDisplay.textContent = "Помилка у коді: " + error.message;
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }
    }
  }

  // -----------------------------------------
  // 📝 4. HOMEWORK MANAGER
  // -----------------------------------------
  class HomeworkManager {
    constructor() {
      this.hwForm = document.getElementById("homework-form");
      if (!this.hwForm) return;

      this.studentNameInput = document.getElementById("student-name");
      this.saveBtn = document.getElementById("save-hw-btn");
      this.copyBtn = document.getElementById("copy-hw-btn");
      this.clearBtn = document.getElementById("clear-hw-btn");
      this.errorMsg = document.getElementById("hw-error-msg");

      // Елементи модального вікна
      this.clearDialog = document.getElementById("clear-confirm-dialog");
      this.dialogCancelBtn = document.getElementById("dialog-cancel-btn");
      this.dialogConfirmBtn = document.getElementById("dialog-confirm-btn");

      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.formStorageKey = "lms_hw_form_" + this.pageId;

      this.init();
    }

    init() {
      this.hwForm.addEventListener("submit", (e) => e.preventDefault());
      this.loadSavedData();
      this.hwForm.addEventListener("input", () => this.saveData());

      if (this.saveBtn)
        this.saveBtn.addEventListener("click", () => this.handleSave());
      if (this.copyBtn)
        this.copyBtn.addEventListener("click", () => this.handleCopy());

      // Відкриття модального вікна замість alert
      if (this.clearBtn)
        this.clearBtn.addEventListener("click", () => this.handleClearClick());

      // Кнопки всередині модального вікна
      if (this.dialogCancelBtn)
        this.dialogCancelBtn.addEventListener("click", () =>
          this.clearDialog.close(),
        );
      if (this.dialogConfirmBtn)
        this.dialogConfirmBtn.addEventListener("click", () =>
          this.executeClear(),
        );
    }

    loadSavedData() {
      const savedData = JSON.parse(
        localStorage.getItem(this.formStorageKey) || "{}",
      );
      this.hwForm
        .querySelectorAll("input, textarea:not(.custom-editor-input)")
        .forEach((el) => {
          if (el.type === "radio" || el.type === "checkbox") {
            if (savedData[el.name] && savedData[el.name].includes(el.value))
              el.checked = true;
          } else {
            if (savedData[el.name]) el.value = savedData[el.name];
          }
        });
    }

    saveData() {
      const data = {};
      this.hwForm
        .querySelectorAll(
          "input[type='radio']:checked, input[type='checkbox']:checked",
        )
        .forEach((el) => {
          if (!data[el.name]) data[el.name] = [];
          data[el.name].push(el.value);
        });
      this.hwForm
        .querySelectorAll(
          "textarea:not(.custom-editor-input), input[type='text']",
        )
        .forEach((el) => {
          data[el.name] = el.value;
        });

      localStorage.setItem(this.formStorageKey, JSON.stringify(data));
      this.errorMsg.style.display = "none";
      this.hwForm
        .querySelectorAll(".error-highlight")
        .forEach((el) => el.classList.remove("error-highlight"));
    }

    collectAndValidate() {
      let isValid = true;
      let outputText = `ДОМАШНЄ ЗАВДАННЯ\n\n`;

      const name = this.studentNameInput.value.trim();
      if (!name) {
        this.studentNameInput
          .closest(".student-info")
          .classList.add("error-highlight");
        isValid = false;
      }

      outputText += `Учень: ${name || "[НЕ ВКАЗАНО]"}\n`;
      const date = new Date();
      outputText += `Час виконання: ${date.toLocaleDateString("uk-UA")} о ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}\n\n- - - - - - - - - - - - - - - - - - - -\n\n`;

      const questions = this.hwForm.querySelectorAll(
        ".test-question:not(.student-info)",
      );

      questions.forEach((qBlock) => {
        let qText = "";
        const questionTitle = qBlock.querySelector("legend, p");

        if (questionTitle) {
          qText = questionTitle.textContent.replace(/\s+/g, " ").trim();
          const codeSnippet = qBlock.querySelector("pre code");
          if (codeSnippet) qText += `\n${codeSnippet.textContent}`;
        } else if (qBlock.querySelector(".editor-title")) {
          qText =
            "Практичне завдання (" +
            qBlock
              .querySelector(".editor-title")
              .textContent.replace(/\s+/g, " ")
              .trim() +
            ")";
        }

        let answerText = "";
        let isAnswered = false;

        const checkedRadio = qBlock.querySelector(".test-radio:checked");
        if (checkedRadio) {
          answerText = checkedRadio.value;
          isAnswered = true;
        }

        const checkedBoxes = qBlock.querySelectorAll(".test-checkbox:checked");
        if (checkedBoxes.length > 0) {
          answerText = Array.from(checkedBoxes)
            .map((cb) => cb.value)
            .join(", ");
          isAnswered = true;
        }

        const textarea = qBlock.querySelector(".test-textarea");
        if (textarea && textarea.value.trim() !== "") {
          answerText = textarea.value.trim();
          isAnswered = true;
        }

        const editorWrapper = qBlock.querySelector(".custom-editor-wrapper");
        if (editorWrapper) {
          const cmInstance =
            editorWrapper.querySelector(".CodeMirror")?.CodeMirror;
          if (cmInstance && cmInstance.getValue().trim() !== "") {
            answerText = "\n" + cmInstance.getValue();
            isAnswered = true;
          }
        }

        if (!isAnswered) {
          qBlock.classList.add("error-highlight");
          isValid = false;
        }

        if (qText || answerText) {
          outputText += `❓ Питання: ${qText}\n📝 Відповідь: ${answerText || "[Немає відповіді]"}\n\n- - - - - - - - - - - - - - - - - - - -\n\n`;
        }
      });

      return {
        isValid,
        outputText: outputText.replace(/\t/g, "  ").replace(/\u00A0/g, " "),
        name,
      };
    }

    handleSave() {
      const { isValid, outputText, name } = this.collectAndValidate();

      if (!isValid) {
        this.errorMsg.style.display = "block";
        document
          .querySelector(".error-highlight")
          .scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const titleElement = document.getElementById("lesson-title");
      const pageTitle = titleElement ? titleElement.textContent.trim() : "Тема";

      const safeTopic = pageTitle
        .replace(/\s+/g, "_")
        .replace(/[^a-zа-яіїєґ0-9_]/gi, "");
      const safeName = name.replace(/[^a-zа-яіїєґ0-9]/gi, "_");

      a.href = url;
      a.download = `ДЗ_${safeTopic}_${safeName}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.tempFeedback(
        this.saveBtn,
        "✅ Успішно збережено!",
        "mediumseagreen",
      );
    }

    handleCopy() {
      const { isValid, outputText } = this.collectAndValidate();

      if (!isValid) {
        this.errorMsg.style.display = "block";
        document
          .querySelector(".error-highlight")
          .scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      navigator.clipboard.writeText(outputText).then(() => {
        this.tempFeedback(this.copyBtn, "✅ Скопійовано!", null);
      });
    }

    handleClearClick() {
      if (this.clearDialog) {
        this.clearDialog.showModal();
      }
    }

    executeClear() {
      localStorage.removeItem(this.formStorageKey);
      this.hwForm
        .querySelectorAll(".custom-editor-wrapper")
        .forEach((wrapper) => {
          localStorage.removeItem("lms_code_" + this.pageId + "_" + wrapper.id);
        });
      window.location.reload();
    }

    tempFeedback(btn, text, color) {
      const originalText = btn.innerHTML;
      btn.innerHTML = text;
      if (color) {
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
      }
      setTimeout(() => {
        btn.innerHTML = originalText;
        if (color) {
          btn.style.backgroundColor = "";
          btn.style.borderColor = "";
        }
      }, 2500);
    }
  }

  // -----------------------------------------
  // 🌐 5. GLOBAL EVENT DELEGATOR (The Traffic Controller)
  // -----------------------------------------
  class GlobalEvents {
    constructor(themeMgr, uiMgr) {
      this.themeMgr = themeMgr;
      this.uiMgr = uiMgr;

      this.isScrolling = false;
      this.init();
    }

    init() {
      // 1. One Click Listener for the entire document
      document.addEventListener("click", (e) => this.handleClick(e));

      // 2. One Scroll Listener using requestAnimationFrame for performance
      window.addEventListener("scroll", () => {
        if (!this.isScrolling) {
          window.requestAnimationFrame(() => {
            this.uiMgr.handleScroll();
            this.isScrolling = false;
          });
          this.isScrolling = true;
        }
      });
    }

    handleClick(e) {
      // A. Scroll To Top Button
      const scrollBtn = e.target.closest("#scrollToTopBtn");
      if (scrollBtn) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // B. Dyslexia Mode Toggle
      const dyslexiaBtn = e.target.closest("#dyslexia-mode-btn");
      if (dyslexiaBtn) {
        e.preventDefault();
        this.themeMgr.toggleDyslexiaMode(dyslexiaBtn);
        return;
      }

      // C. Download Links (File checking)
      const downloadLink = e.target.closest("a[download]:not([data-temp])");
      if (downloadLink) {
        e.preventDefault();
        this.uiMgr.handleDownloadClick(downloadLink);
        return;
      }

      // D. Smooth Page Transitions for regular links
      const navLink = e.target.closest("a");
      if (navLink) {
        if (
          navLink.hasAttribute("download") ||
          navLink.target === "_blank" ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey ||
          navLink.origin !== window.location.origin ||
          navLink.hash ||
          navLink.getAttribute("href") === "" ||
          navLink.getAttribute("href") === "#"
        ) {
          return; // Let default behavior happen
        }

        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => (window.location.href = navLink.href), 700);
      }
    }
  }

  // -----------------------------------------
  // 🏁 6. INITIALIZATION (The Engine)
  // -----------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const themeManager = new ThemeManager();
    const uiManager = new UIManager();
    new CodeManager();
    new HomeworkManager();
    new GlobalEvents(themeManager, uiManager);
  });
})(); // End of IIFE
