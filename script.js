// Character counter for comment textarea
document.getElementById("comment").addEventListener("input", function () {
  const maxLength = this.getAttribute("maxlength");
  const currentLength = this.value.length;
  document.getElementById(
    "commentCounter"
  ).textContent = `${currentLength}/${maxLength} characters`;
});

// Toggle name selection based on anonymous checkbox
function toggleNameSelection() {
  const anonymousCheckbox = document.getElementById("anonymousCheckbox");
  const nameSelectContainer = document.getElementById("nameSelectContainer");
  const nameSelect = document.getElementById("nameSelect");

  if (anonymousCheckbox.checked) {
    nameSelectContainer.style.display = "none";
    nameSelect.removeAttribute("required");
  } else {
    nameSelectContainer.style.display = "block";
    nameSelect.setAttribute("required", "required");
  }
}

// File validation
document.getElementById("attachments").addEventListener("change", function (e) {
  const files = e.target.files;
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  const allowedTypes = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
  const fileList = document.getElementById("fileList");
  const errorDiv = document.getElementById("fileError");

  fileList.innerHTML = "";
  errorDiv.innerHTML = "";
  let hasError = false;

  for (let file of files) {
    const extension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(extension)) {
      errorDiv.innerHTML += `Error: "${
        file.name
      }" has an invalid file type. Allowed types are: ${allowedTypes.join(
        ", "
      )}<br>`;
      hasError = true;
      continue;
    }

    // Check file size
    if (file.size > maxSize) {
      errorDiv.innerHTML += `Error: "${file.name}" exceeds the maximum file size of 5MB<br>`;
      hasError = true;
      continue;
    }

    // Add to file list
    const fileItem = document.createElement("div");
    fileItem.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(
      2
    )}MB)`;
    fileList.appendChild(fileItem);
  }

  if (hasError) {
    this.value = ""; 
    fileList.innerHTML = "";
  }
});

// Form submission handler
function handleSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return false;
  }

  // Disable submit button to prevent double submission
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = true;

  const form = event.target;
  const formData = new FormData(form);

  fetch("process_form.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your feedback has been submitted successfully.",
          confirmButtonText: "OK",
          confirmButtonColor: "#5d9cec",
        }).then(() => {
          // Reset form
          form.reset();
          document.getElementById("fileList").innerHTML = "";
          document.getElementById("commentCounter").textContent =
            "0/1000 characters";
        });
      } else {
        throw new Error(data.message || "Submission failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was a problem submitting your feedback. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#5d9cec",
      });
    })
    .finally(() => {
      // Re-enable submit button
      submitButton.disabled = false;
    });

  return false;
}

document.addEventListener("DOMContentLoaded", function () {
  toggleNameSelection(); // Set initial state
});

function goToFeedback() {
  // Get the feedback section element
  const feedbackSection = document.getElementById("feedback");

  // Scroll to the feedback section smoothly
  feedbackSection.scrollIntoView({ behavior: "smooth" });
}

function validateForm() {
  let isValid = true;
  const comment = document.getElementById("comment");
  const nameSelect = document.getElementById("nameSelect");
  const anonymousCheckbox = document.getElementById("anonymousCheckbox");

  // Clear previous error messages
  document.getElementById("commentError").innerHTML = "";
  document.getElementById("nameSelectError").innerHTML = "";

  // Validate comment
  if (comment.value.length < 10) {
    document.getElementById("commentError").innerHTML =
      "Comment must be at least 10 characters long";
    isValid = false;
  }

  // Validate name selection if not anonymous
  if (!anonymousCheckbox.checked && nameSelect.value === "") {
    document.getElementById("nameSelectError").innerHTML =
      "Please select your name";
    isValid = false;
  }

  return isValid;
}
