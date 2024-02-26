import Express from "express";
import cors from "cors";
import fs from "fs";
import connectMongoDB from "./lib/db.js";
import Tasks from "./models/tasks.js";
import chalk from "chalk";

const app = Express();
app.use(cors());
app.use(Express.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
  const entryDocuments = await Tasks.countDocuments();
  const tasks = req.body; // No need for [...req.body], as it's already an array
  const promises = [];

  // Iterate through tasks asynchronously
  for (const task of tasks) {
    // Check if a task with the same question already exists
    const existingTask = await Tasks.findOne({ question: task.Q });

    // If task with the same question doesn't exist, proceed to save
    if (!existingTask) {
      try {
        const number = await Tasks.countDocuments();
        const newTask = {
          question: task.Q,
          answer: task.A,
        };

        if (task.I) {
          const base64Data = task.I.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `./images2/${String(number)}.png`;

          // Write file asynchronously and push the promise to array
          promises.push(
            new Promise((resolve, reject) => {
              fs.writeFile(fileName, buffer, async (err) => {
                if (err) {
                  reject(err);
                } else {
                  newTask.imagePath = fileName;
                  try {
                    await Tasks.create(newTask);
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                }
              });
            })
          );
        } else {
          // If task has no image, directly save it to MongoDB
          promises.push(Tasks.create(newTask));
        }
      } catch (err) {
        console.error("Error saving task:", err);
      }
    }
  }

  try {
    // Wait for all promises to resolve
    await Promise.all(promises);
    const endingDocuments = await Tasks.countDocuments();
    console.log(chalk.green(`Overall tasks: ${endingDocuments}`));
    console.log(chalk.blue(`New tasks : ${endingDocuments - entryDocuments}`));
    return res.json({ number: endingDocuments });
  } catch (error) {
    console.error("Error saving tasks:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

connectMongoDB()
  .then(() => {
    app.listen("3000", () => {
      console.log("Listening on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
