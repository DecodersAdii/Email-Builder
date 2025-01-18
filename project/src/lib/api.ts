const API_URL = 'http://localhost:3000/api';

export async function getEmailLayout() {
  const response = await fetch(`${API_URL}/getEmailLayout`);
  return response.text();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/uploadImage`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function saveTemplate(template: any) {
  const response = await fetch(`${API_URL}/uploadEmailConfig`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  return response.json();
}

export async function getTemplates() {
  const response = await fetch(`${API_URL}/templates`);
  return response.json();
}

export async function renderTemplate(template: any) {
  const response = await fetch(`${API_URL}/renderAndDownloadTemplate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  return response.blob();
}