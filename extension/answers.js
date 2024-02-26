async function downloadImage(src) {
  try {
    const response = await fetch(src);
    const imageBlob = await response.blob();

    // Convert the image blob to a Base64 string
    const base64String = await blobToBase64(imageBlob);

    return base64String;
  } catch (error) {
    console.log(error);
    throw error; // Re-throwing the error for handling outside
  }
}

// Function to convert a Blob object to Base64 string
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result.split(",")[1]); // Extracting the Base64 string
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const column = document.querySelectorAll(".row > .col-md-9")[0];
const array = [...column.childNodes];
const shit = [];

// Define an async function to use await inside forEach
const processElements = async () => {
  for (const ele of array) {
    if (ele.className === "question") {
      shit.push({
        type: "Q",
        value: ele.innerText.substring(3).trim(),
      });
    } else if (ele.className === "correct_answer") {
      shit.push({
        type: "A",
        value: ele.innerText.substring(3).trim(),
      });
    } else if (ele.className === "image") {
      const imageSrc = ele.firstChild.attributes.src.value;
      try {
        const imageBlob = await downloadImage(imageSrc);
        shit.push({ type: "I", value: imageBlob });
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    }
  }
};

// Call the async function to process elements
processElements()
  .then(() => {
    // After all elements are processed
    console.log(shit);
    const groupedData = groupElements(shit);
    console.log(groupedData);
    sendDataToServer(groupedData);
  })
  .catch((error) => {
    console.error("Error processing elements:", error);
  });

function groupElements(data) {
  const groupedData = [];
  let currentGroup = {};

  data.forEach((item) => {
    if (item.type === "Q") {
      // If it's a question, start a new group
      currentGroup = { Q: item.value };
      groupedData.push(currentGroup);
    } else if (item.type === "A") {
      // If it's an answer, add it to the current group
      currentGroup.A = item.value;
    } else if (item.type === "I") {
      // If it's an image, add it to the current group if it exists
      if (currentGroup) {
        currentGroup.I = item.value;
      }
    }
  });

  return groupedData;
}

async function sendDataToServer(data) {
  try {
    const response = await fetch("http://localhost:3000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    console.log(responseData);
    if (responseData.number < 1045) {
      var els = document.querySelectorAll("a[href='../test-site']");
      els[0].click();
    }
  } catch (error) {
    console.error("Error sending data to server:", error);
  }
}

// Assuming 'groupedData' contains the data you want to send
