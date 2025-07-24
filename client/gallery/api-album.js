const create = async (album, credentials) => {
  try {
    let response = await fetch("/api/albums", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(album),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const list = async (signal) => {
  try {
    let response = await fetch("/api/albums", {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const listAll = async (credentials, signal) => {
  try {
    let response = await fetch("/api/albums/all", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const read = async (params, signal) => {
  try {
    let response = await fetch("/api/albums/" + params.albumId, {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const update = async (params, credentials, album) => {
  try {
    let response = await fetch("/api/albums/" + params.albumId, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(album),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const remove = async (params, credentials) => {
  try {
    let response = await fetch("/api/albums/" + params.albumId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const addMedia = async (params, credentials, media) => {
  try {
    let response = await fetch("/api/albums/" + params.albumId + "/media", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(media),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const removeMedia = async (params, credentials) => {
  try {
    let response = await fetch("/api/albums/" + params.albumId + "/media/" + params.mediaId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

export { create, list, listAll, read, update, remove, addMedia, removeMedia };
