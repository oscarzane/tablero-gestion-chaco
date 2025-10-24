const localFolder = "http://localhost/ch-estadistica/api/";
const serverFolder = "/sistema/api/";

export function serverPath(){
    if(window.location.hostname === "localhost")
        return localFolder;
    else
        return serverFolder;
}

export async function postData(name = '', data = {}) {
    const response = { data: {}, error: "", warning: "", filename: "" };

    await fetch(serverPath() + name, {
        /*mode: 'no-cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client*/
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
            //'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
        .then((res) => {
            var t_contentDisposition = res.headers.get("content-disposition");
            if(t_contentDisposition!=null && t_contentDisposition.includes("attachment")){
                response.filename = t_contentDisposition.split(";")[1].split('=')[1];
                return res.blob();
            }
            else{
                return res.json();
            }
            
        })
        .then((data) => {
            response.data = data.data ? data.data : (data ? data : []);
            response.error = data.error ? data.error : "";
            response.warning = data.warning ? data.warning : "";
        })
        .catch((error) => {
            var t_error = error.message;
            switch(t_error){
                case "Failed to fetch": { t_error = "Error al conectar con el servidor"; } break;
            }
            response.error = t_error;
        });

    return response;
}

export async function postFiles(name = '', data = {}, files = {}) {
    const response = { data: {}, error: "", warning: "" };

    const keysData = Object.keys(data);
    const keysFiles = Object.keys(files);
    const formData = new FormData();
    
    for (var i = 0; i < keysData.length; i++) {
        formData.append(keysData[i], data[keysData[i]]);
    }
    for (i = 0; i < keysFiles.length; i++) {
        for (var i2 = 0; i2 < files[keysFiles[i]].length; i2++) {
            if (files[keysFiles[i]][i2].file !== null)
                formData.append(keysFiles[i] + "_" + i2, files[keysFiles[i]][i2].file);
        }
        formData.append(keysFiles[i], JSON.stringify(files[keysFiles[i]]));
    }

    await fetch(serverPath() + name, {
        method: 'POST',
        body: formData
    })
        .then((res) => res.json())
        .then((data) => {
            response.data = data.data ? data.data : [];
            response.error = data.error ? data.error : "";
            response.warning = data.warning ? data.warning : "";
        })
        .catch((error) => {
            var t_error = error.message;
            switch(t_error){
                case "Failed to fetch": { t_error = "Error al conectar con el servidor"; } break;
            }
            response.error = t_error;
        });

    return response;
}
