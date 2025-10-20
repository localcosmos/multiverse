export function useFilterSpace(space: { isSelected: boolean; select: () => void; deselect: () => void }, readOnly: boolean) {
  const toggleSelection = () => {
    if (!readOnly) {
      if (space.isSelected) {
        space.deselect();
      } else {
        space.select();
      }
    }
  };

  return {
    toggleSelection,
  };
}