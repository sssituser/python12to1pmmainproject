import axios from 'axios';

const GOOGLE_CLIENT_ID = "593269339291-kleojkcokfijos790jnpsqujd1gk8jkd.apps.googleusercontent.com";
const TARGET_EMAIL = "hrmanagersssit@gmail.com";

export const googleDriveService = {
  uploadFile: async (fileBlob, fileName) => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google) {
          reject(new Error("Google Identity Services not loaded"));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          hint: TARGET_EMAIL, 
          prompt: 'consent', // Explicitly ask for consent to ensure scopes are refreshed
          callback: async (tokenResponse) => {
            if (tokenResponse.error !== undefined) {
              console.error("OAuth Error:", tokenResponse.error, tokenResponse.error_description);
              if (tokenResponse.error === 'access_denied') {
                reject(new Error("Access denied. Please ensure your account is added as a 'Test User' in the Google Cloud Console."));
              } else {
                reject(new Error(`OAuth Error: ${tokenResponse.error}`));
              }
              return;
            }

            const accessToken = tokenResponse.access_token;
            
            try {
              // 1. Upload File
              const metadata = {
                name: fileName,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              };

              const formData = new FormData();
              formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
              formData.append('file', fileBlob);

              const uploadRes = await axios.post(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                formData,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              const fileId = uploadRes.data.id;

              // 2. Share File with HR Manager
              try {
                await axios.post(
                  `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
                  {
                    role: 'writer',
                    type: 'user',
                    emailAddress: TARGET_EMAIL,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                console.log(`✅ File shared with ${TARGET_EMAIL}`);
              } catch (shareError) {
                console.error('⚠️ Sharing failed, but file was uploaded:', shareError);
              }

              resolve(uploadRes.data);
            } catch (error) {
              console.error('Drive upload failed:', error);
              reject(error);
            }
          },
        });

        client.requestAccessToken();
      } catch (err) {
        console.error('GIS Initialization Error:', err);
        reject(err);
      }
    });
  }
};
