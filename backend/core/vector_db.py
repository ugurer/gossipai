import faiss
import numpy as np
from typing import Dict, List, Any, Tuple
import pickle
import os

class VectorDB:
    def __init__(self, dimension: int = 768):
        """
        Args:
            dimension: Vektör boyutu (default: SBERT model boyutu)
        """
        self.dimension = dimension
        self.index = faiss.IndexIDMap(faiss.IndexFlatIP(dimension))
        self.metadata_store: Dict[int, Dict[str, Any]] = {}
        
    def add_vectors(self, vectors: np.ndarray, metadata_list: List[Dict[str, Any]]) -> None:
        """Vektörleri ve metadatayı veritabanına ekler."""
        if len(vectors) != len(metadata_list):
            raise ValueError("Vektör ve metadata sayısı eşleşmiyor")
            
        vector_ids = np.arange(len(self.metadata_store), 
                             len(self.metadata_store) + len(vectors))
        
        self.index.add_with_ids(vectors, vector_ids)
        
        for vid, metadata in zip(vector_ids, metadata_list):
            self.metadata_store[int(vid)] = metadata
            
    def search(self, query_vector: np.ndarray, k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """En yakın k vektörü arar."""
        query_vector = query_vector.reshape(1, -1)
        distances, indices = self.index.search(query_vector, k)
        
        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx != -1:  # Geçerli bir sonuç
                results.append((float(distance), self.metadata_store[int(idx)]))
                
        return results
    
    def save(self, path: str) -> None:
        """Veritabanını diske kaydeder."""
        faiss.write_index(self.index, f"{path}.index")
        with open(f"{path}.metadata", "wb") as f:
            pickle.dump(self.metadata_store, f)
            
    @classmethod
    def load(cls, path: str) -> "VectorDB":
        """Veritabanını diskten yükler."""
        instance = cls()
        instance.index = faiss.read_index(f"{path}.index")
        with open(f"{path}.metadata", "rb") as f:
            instance.metadata_store = pickle.load(f)
        return instance 