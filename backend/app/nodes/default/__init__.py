"""
Default nodes for BPAZ-Agentic-Platform workflows.
These nodes provide basic workflow structure and control flow.
"""

from .start_node import StartNode
from .end_node import EndNode

__all__ = [
    "StartNode",
    "EndNode"
] 