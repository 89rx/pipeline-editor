import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# For Vercel deployments, it is often safest to allow the specific 
# frontend origin or use a wildcard during troubleshooting.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for debugging 405 errors
    allow_credentials=True,
    allow_methods=["*"],  # Crucial for allowing POST and OPTIONS requests
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str
    targetHandle: str

class PipelineRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    if not edges:
        return True

    graph = {}
    in_degree = {node.id: 0 for node in nodes}

    for edge in edges:
        if edge.source not in graph:
            graph[edge.source] = []
        graph[edge.source].append(edge.target)

        if edge.target in in_degree:
            in_degree[edge.target] += 1
        else:
            in_degree[edge.target] = 1

    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]

    if not queue:
        return False

    processed_count = 0
    while queue:
        current = queue.pop(0)
        processed_count += 1

        if current in graph:
            for neighbor in graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

    return processed_count == len(nodes)

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

# Ensure the path exactly matches the fetch call in submit.js
@app.post("/api/pipelines/parse")
async def parse_pipeline(pipeline: PipelineRequest):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)

    is_dag_result = is_dag(pipeline.nodes, pipeline.edges)

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": is_dag_result
    }