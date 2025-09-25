#!/usr/bin/env python3
"""Block data editing helper for the dungeon game project.

This utility makes it easier to inspect and edit entries that live inside
``blockdata.json``.  It exposes a small command line interface with the
following sub-commands:

``list``
    Print a table of blocks for the selected array.  Levels and keys can be
    filtered.  This is useful to understand the existing content before making
    changes.

``show``
    Display the full JSON entry for a specific block key.

``add``
    Append a new block entry.  All fields can be specified via command line
    flags.  Missing optional fields fall back to sensible defaults.  The new
    entry is validated to ensure that the key is unique inside the target
    array.

``update``
    Update one or more fields on an existing block.  Only the supplied fields
    are modified.

``delete``
    Remove a block from the data set.

The script keeps the file formatted with an indentation of two spaces and sorts
entries by level and then key so the resulting JSON stays consistent with the
rest of the repository.
"""

from __future__ import annotations

import argparse
import json
from collections import OrderedDict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

FIELD_ORDER = [
    "key",
    "name",
    "level",
    "size",
    "depth",
    "chest",
    "type",
    "bossFloors",
]

BLOCK_ARRAYS = ("blocks1", "blocks2", "blocks3")


def default_data_path() -> Path:
    """Return the path to ``blockdata.json`` relative to the repo root."""

    return Path(__file__).resolve().parents[1] / "blockdata.json"


def load_data(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_data(path: Path, data: Dict[str, Any]) -> None:
    for arr_name in BLOCK_ARRAYS:
        entries = [normalize_entry(e) for e in data.get(arr_name, [])]
        data[arr_name] = sorted(entries, key=lambda item: (item.get("level", 0), item.get("key", "")))
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def normalize_entry(entry: Dict[str, Any]) -> OrderedDict:
    ordered = OrderedDict()
    for field in FIELD_ORDER:
        if field in entry:
            ordered[field] = entry[field]
    for key, value in entry.items():
        if key not in ordered:
            ordered[key] = value
    return ordered


def find_entry(data: Dict[str, Any], key: str) -> Optional[Tuple[str, Dict[str, Any], int]]:
    for arr_name in BLOCK_ARRAYS:
        arr = data.get(arr_name, [])
        for index, entry in enumerate(arr):
            if entry.get("key") == key:
                return arr_name, entry, index
    return None


def ensure_array_name(name: Optional[str]) -> str:
    if name is None:
        raise SystemExit("--set/--array is required for this operation")
    if name not in BLOCK_ARRAYS:
        raise SystemExit(f"Unknown array '{name}'. Choose from: {', '.join(BLOCK_ARRAYS)}")
    return name


def list_blocks(data: Dict[str, Any], array_name: str, levels: Optional[Iterable[int]], keys: Optional[Iterable[str]]) -> None:
    arr = data.get(array_name, [])
    levels_set = set(levels) if levels else None
    keys_set = set(keys) if keys else None
    filtered: List[Dict[str, Any]] = []
    for entry in arr:
        level = entry.get("level")
        key = entry.get("key")
        if levels_set is not None and level not in levels_set:
            continue
        if keys_set is not None and key not in keys_set:
            continue
        filtered.append(entry)

    if not filtered:
        print("No matching blocks found.")
        return

    width_key = max(len(str(e.get("key", ""))) for e in filtered)
    width_name = max(len(str(e.get("name", ""))) for e in filtered)
    print(f"Listing {len(filtered)} block(s) from {array_name}:")
    for entry in sorted(filtered, key=lambda item: (item.get("level", 0), item.get("key", ""))):
        level = entry.get("level")
        key = str(entry.get("key", ""))
        name = str(entry.get("name", ""))
        chest = entry.get("chest")
        btype = entry.get("type")
        print(f"  Lv {level:>3} | {key:<{width_key}} | {name:<{width_name}} | chest={chest} | type={btype}")


def show_block(data: Dict[str, Any], key: str) -> None:
    result = find_entry(data, key)
    if not result:
        raise SystemExit(f"Key '{key}' not found")
    _, entry, _ = result
    print(json.dumps(normalize_entry(entry), ensure_ascii=False, indent=2))


def add_block(data: Dict[str, Any], array_name: str, fields: Dict[str, Any]) -> None:
    arr = data.setdefault(array_name, [])
    key = fields["key"]
    if any(entry.get("key") == key for entry in arr):
        raise SystemExit(f"Key '{key}' already exists in {array_name}")

    entry = OrderedDict()
    for field in FIELD_ORDER:
        if field == "bossFloors":
            entry[field] = fields.get(field, [])
        else:
            entry[field] = fields.get(field)
    arr.append(entry)
    print(f"Added {key} to {array_name}.")


def update_block(data: Dict[str, Any], key: str, updates: Dict[str, Any]) -> None:
    result = find_entry(data, key)
    if not result:
        raise SystemExit(f"Key '{key}' not found")
    arr_name, entry, index = result

    for field, value in updates.items():
        if value is None:
            continue
        entry[field] = value
    data[arr_name][index] = normalize_entry(entry)
    print(f"Updated {key} in {arr_name}.")


def delete_block(data: Dict[str, Any], key: str) -> None:
    result = find_entry(data, key)
    if not result:
        raise SystemExit(f"Key '{key}' not found")
    arr_name, _, index = result
    data[arr_name].pop(index)
    print(f"Deleted {key} from {arr_name}.")


def parse_boss_floors(value: Optional[str]) -> Optional[List[int]]:
    if value is None:
        return None
    if not value.strip():
        return []
    try:
        return [int(v) for v in value.split(",")]
    except ValueError as exc:
        raise SystemExit("Invalid boss floor list. Use comma separated integers, e.g. 5,10") from exc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Edit blockdata.json entries.")
    parser.add_argument("--data", type=Path, default=default_data_path(), help="Path to blockdata.json")

    subparsers = parser.add_subparsers(dest="command")

    list_parser = subparsers.add_parser("list", help="List blocks in an array")
    list_parser.add_argument("--set", "--array", dest="array", choices=BLOCK_ARRAYS, required=True)
    list_parser.add_argument("--level", action="append", type=int, dest="levels", help="Filter by level (can repeat)")
    list_parser.add_argument("--key", action="append", dest="keys", help="Filter by key (can repeat)")

    show_parser = subparsers.add_parser("show", help="Show a block entry")
    show_parser.add_argument("key")

    add_parser = subparsers.add_parser("add", help="Add a new block entry")
    add_parser.add_argument("--set", "--array", dest="array", choices=BLOCK_ARRAYS, required=True)
    add_parser.add_argument("--key", required=True)
    add_parser.add_argument("--name", required=True)
    add_parser.add_argument("--level", type=int, required=True)
    add_parser.add_argument("--size", type=int, default=0)
    add_parser.add_argument("--depth", type=int, default=0)
    add_parser.add_argument("--chest", default="normal")
    add_parser.add_argument("--type", default=None)
    add_parser.add_argument("--boss-floors", dest="boss_floors", default=None, help="Comma separated floor numbers")

    update_parser = subparsers.add_parser("update", help="Update an existing block")
    update_parser.add_argument("key")
    update_parser.add_argument("--name")
    update_parser.add_argument("--level", type=int)
    update_parser.add_argument("--size", type=int)
    update_parser.add_argument("--depth", type=int)
    update_parser.add_argument("--chest")
    update_parser.add_argument("--type")
    update_parser.add_argument("--boss-floors", dest="boss_floors")

    delete_parser = subparsers.add_parser("delete", help="Delete a block by key")
    delete_parser.add_argument("key")

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return

    data_path: Path = args.data
    if not data_path.exists():
        raise SystemExit(f"Data file '{data_path}' does not exist")
    data = load_data(data_path)

    if args.command == "list":
        list_blocks(data, args.array, args.levels, args.keys)
        return

    if args.command == "show":
        show_block(data, args.key)
        return

    if args.command == "add":
        fields = {
            "key": args.key,
            "name": args.name,
            "level": args.level,
            "size": args.size,
            "depth": args.depth,
            "chest": args.chest,
            "type": args.type,
            "bossFloors": parse_boss_floors(args.boss_floors) or [],
        }
        add_block(data, args.array, fields)
        save_data(data_path, data)
        return

    if args.command == "update":
        updates = {
            "name": args.name,
            "level": args.level,
            "size": args.size,
            "depth": args.depth,
            "chest": args.chest,
            "type": args.type,
            "bossFloors": parse_boss_floors(args.boss_floors),
        }
        update_block(data, args.key, updates)
        save_data(data_path, data)
        return

    if args.command == "delete":
        delete_block(data, args.key)
        save_data(data_path, data)
        return

    raise SystemExit(f"Unknown command: {args.command}")


if __name__ == "__main__":
    main()
