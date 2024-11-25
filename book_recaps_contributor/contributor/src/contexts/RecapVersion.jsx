import { createContext, useContext, useEffect, useState } from "react";

const RecapVersionContext = createContext(null);

export const RecapVersionProvider = ({ children, initialRecapVersion, deferredKeyIdeas }) => {
  const [ recapVersion, setRecapVersion ] = useState(initialRecapVersion);
  const [ activeIndex, setActiveIndex ] = useState(0);
  const [ keyIdeas, setKeyIdeas ] = useState(null); // Initial loading state
  const [ plagiarismResults, setPlagiarismResults ] = useState(null);
  const [ isKeyIdeasLocked, setIsKeyIdeasLocked ] = useState(false);
  const [ isKeyIdeasChanged, setIsKeyIdeasChanged ] = useState(false);

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
        isSaving: false,
      })));
    });
  }, [ deferredKeyIdeas ]);

  const addNewKeyIdea = () => {
    if (!keyIdeas || !recapVersion) return;
    const highestOrder = keyIdeas.reduce((max, idea) => Math.max(max, idea.order), 0);

    setKeyIdeas((prevIdeas) => [ ...prevIdeas, {
      title: "",
      body: "",
      image: "",
      order: highestOrder + 1,
      recapVersionId: recapVersion.id,
      id: new Date().getTime(),
      isNewKeyIdea: true,
      isSaving: false
    } ]);
  }

  const setKeyIdeaById = (id, keyIdea) => {
    setKeyIdeas((prevIdeas) => prevIdeas.map(idea => idea.id === id ? { ...idea, ...keyIdea } : idea));
  }

  const removeKeyIdeaById = (id) => {
    setKeyIdeas((prevIdeas) => prevIdeas.filter(idea => idea.id !== id));
  }

  // Key ideas bodies are empty
  const isKeyIdeasEmpty = keyIdeas && keyIdeas.every(idea => !idea.body);

  return (
    <RecapVersionContext.Provider value={{
      activeIndex, setActiveIndex,
      recapVersion, setRecapVersion,
      keyIdeas, setKeyIdeas,
      plagiarismResults, setPlagiarismResults,
      isKeyIdeasLocked, setIsKeyIdeasLocked,
      isKeyIdeasEmpty,
      isKeyIdeasChanged, setIsKeyIdeasChanged,
      addNewKeyIdea, setKeyIdeaById, removeKeyIdeaById
    }}>
      {children}
    </RecapVersionContext.Provider>
  );
};

export const useRecapVersion = () => useContext(RecapVersionContext);
