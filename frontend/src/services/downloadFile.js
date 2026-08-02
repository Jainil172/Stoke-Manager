const apiHost = window.location.hostname || "localhost";

export async function downloadFile(path, filename) {
  const token = localStorage.getItem("stockflow.token");
  const response = await fetch(`http://${apiHost}:5000/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    let message = `Export failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export const reportFileName = (prefix, extension) =>
  `${prefix}-${new Date().toISOString().slice(0, 10)}.${extension}`;
