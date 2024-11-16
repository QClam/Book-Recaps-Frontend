import { generatePath, redirect } from "react-router-dom";

import { axiosInstance } from "../../utils/axios";
import { routes } from "../../routes";
import { handleFetchError } from "../../utils/handleFetchError";

export async function createRecapAction({ request }) {
  const formData = await request.formData();
  const bookId = formData.get('bookId');
  const contributorId = formData.get('userId');
  const name = formData.get('name');

  if (!bookId || !contributorId || !name) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  try {
    const response = await axiosInstance.post('/api/recap/createrecap', {
      bookId, contributorId, name
    });

    return redirect(generatePath(routes.recapVersionDetails, {
      // recapId: response.data.data.id,
      versionId: response.data.data.currentVersionId
    }));
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);

    if (err.status === 401) {
      return redirect(routes.logout);
    }
    return err;
  }
}
