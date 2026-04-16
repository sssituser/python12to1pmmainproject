import axios from 'axios';

const GOOGLE_CLIENT_ID = "593269339291-kleojkcokfijos790jnpsqujd1gk8jkd.apps.googleusercontent.com";

export const googleDriveService = {
  uploadFile: async (fileBlob, fileName) => {
    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: async (tokenResponse) => {
            if (tokenResponse.error !== undefined) {
              reject(tokenResponse);
              return;
            }

            const accessToken = tokenResponse.access_token;
            
            try {
              const metadata = {
                name: fileName,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              };

              const formData = new FormData();
              formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
              formData.append('file', fileBlob);

              const response = await axios.post(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                formData,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              resolve(response.data);
            } catch (error) {
              console.error('Drive upload failed:', error);
              reject(error);
            }
          },
        });

        client.requestAccessToken();
      } catch (err) {
        console.error('GIS Error:', err);
        reject(err);
      }
    });
  }
};
