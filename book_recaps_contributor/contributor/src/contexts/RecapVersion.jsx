import { createContext, useContext, useEffect, useState } from "react";

const RecapVersionContext = createContext(null);

export const RecapVersionProvider = ({ children, initialRecapVersion, deferredKeyIdeas }) => {
  const [ activeIndex, setActiveIndex ] = useState(0);
  const [ recapVersion, setRecapVersion ] = useState(initialRecapVersion);
  const [ keyIdeas, setKeyIdeas ] = useState(null); // Initial loading state
  const [ plagiarismResults, setPlagiarismResults ] = useState(null);
  const [ isKeyIdeasLocked, setIsKeyIdeasLocked ] = useState(false);

  // Effect to set keyIdeas when deferred data is ready
  useEffect(() => {
    deferredKeyIdeas.then((ideas) => {
      setKeyIdeas(ideas.map(idea => ({
        title: idea.title,
        body: idea.body,
        image: idea.image,
        order: idea.order,
        recapVersionId: idea.recapVersionId,
        id: idea.id,
        isNewKeyIdea: false,
        isSaving: false
      })));
    });
  }, [ deferredKeyIdeas ]);

  // Key ideas bodies are empty
  const isKeyIdeasEmpty = keyIdeas && keyIdeas.every(idea => !idea.body);

  return (
    <RecapVersionContext.Provider value={{
      activeIndex, setActiveIndex,
      recapVersion, setRecapVersion,
      keyIdeas, setKeyIdeas,
      plagiarismResults, setPlagiarismResults,
      isKeyIdeasLocked, setIsKeyIdeasLocked,
      isKeyIdeasEmpty
    }}>
      {children}
    </RecapVersionContext.Provider>
  );
};

export const useRecapVersion = () => useContext(RecapVersionContext);
