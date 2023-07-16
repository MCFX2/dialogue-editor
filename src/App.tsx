import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useEffect, useState } from "react";

async function enumerateDirectories(dir: FileSystemDirectoryHandle) {
  const results = [];
  const dirs = dir.values();
  for await (const d of dirs) {
    results.push(d);
  }
  return results;
}

function App() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const [directoryContents, setDirectoryContents] = useState<
    (FileSystemDirectoryHandle | FileSystemFileHandle)[]
  >([]);
  const [firstDirectoryContents, setFirstDirectoryContents] =
    useState<string>("");
  const [firstDirectoryName, setFirstDirectoryName] = useState<string>("");
  
  useEffect(() => {
    async function getDirectory(parentDir: FileSystemDirectoryHandle) {
      const dir = await enumerateDirectories(parentDir);
      setDirectoryContents(dir);
    }
    if (directory) getDirectory(directory);
  }, [directory]);

  useEffect(() => {
    async function readFileContents(file: FileSystemFileHandle) {
      const content = await file.getFile();
      setFirstDirectoryContents(await content.text());
      setFirstDirectoryName(file.name);
    }
    const firstFile = directoryContents.find((e) => e.kind === "file");
    if (firstFile) readFileContents(firstFile as FileSystemFileHandle);
  }, [directoryContents]);

  return (
    <>
      <div className={styles.appBgContainer}>
        <div className={styles.wholeAppBg} />
      </div>
      <div className={styles.wholeAppContainer}>
        <AppSidebar />
        <main>
          <div>
            <button
              onClick={() => {
                window.showDirectoryPicker().then((dir) => {
                  console.log(dir.name);
                  setDirectory(dir);
                });
              }}
            >
              {directory ? (
                <p>
                  Your browser seems to be usable. Nice. You chose the{" "}
                  {directory.name} folder, right?
                </p>
              ) : (
                <p>
                  Click here to see if your browser is actually half-decent.
                </p>
              )}
            </button>

            {directory && directoryContents.length > 0 && (
              <>
                <p>Here's what I see in that folder:</p>
                {directoryContents.map((e) => (
                  <p>{e.name}</p>
                ))}
                <p>Here's the contents of the first file ({firstDirectoryName}):</p>
                {firstDirectoryContents && (
                  <code>{firstDirectoryContents}</code>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
