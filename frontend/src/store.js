
import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      console.log('🔗 STORE: Connection attempt DETAILED:', {
        connection,
        sourceNode: get().nodes.find(n => n.id === connection.source),
        targetNode: get().nodes.find(n => n.id === connection.target),
        allTargetHandles: get().nodes.find(n => n.id === connection.target)?.data?.handles
      });
      
      
      const targetNode = get().nodes.find(n => n.id === connection.target);
      if (targetNode && connection.targetHandle) {
        console.log('🎯 Target node handles:', 
          targetNode.data?.handles?.map(h => ({ id: h.id, type: h.type })) || 'No handles in data'
        );
      }
    
      
      const newEdge = {
        ...connection, 
        type: 'smoothstep', 
        animated: true, 
        markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}
      };
      
      console.log('✅ STORE: Creating edge:', newEdge);
      set({
        edges: addEdge(newEdge, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },
  }));