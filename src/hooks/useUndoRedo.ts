import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo() {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast((old) => {
        // Limit history size to 50
        const newPast = [...old, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
        if (newPast.length > 50) return newPast.slice(1);
        return newPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[], setNodes: (nodes: Node[]) => void, setEdges: (edges: Edge[]) => void) => {
    if (past.length === 0) return;

    const newPast = [...past];
    const previous = newPast.pop();

    if (previous) {
      setFuture((old) => [{ nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)) }, ...old]);
      setPast(newPast);
      setNodes(previous.nodes);
      setEdges(previous.edges);
    }
  }, [past]);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[], setNodes: (nodes: Node[]) => void, setEdges: (edges: Edge[]) => void) => {
    if (future.length === 0) return;

    const newFuture = [...future];
    const next = newFuture.shift();

    if (next) {
      setPast((old) => [...old, { nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)) }]);
      setFuture(newFuture);
      setNodes(next.nodes);
      setEdges(next.edges);
    }
  }, [future]);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
