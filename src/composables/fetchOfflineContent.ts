export async function fetchOfflineContent (url: string): Promise<Record<string, any>> {
  let data: any = null;
  let error = null;

  await fetch(url)
    .then(res => res.json())
    .then(json => (data = json))
    .catch(err => (error = err));

  return { data, error };
}
