"""Export/import the recovery key explicitly. Never prints the key.
Keep the exported .key offline and separate from .obsbackup files.
"""
import argparse,base64,os
from pathlib import Path
from recovery_drill import ROOT,dpapi
p=argparse.ArgumentParser();g=p.add_mutually_exclusive_group(required=True);g.add_argument('--export',dest='export_to');g.add_argument('--import',dest='import_from');args=p.parse_args()
protected=ROOT/'RecoveryKeys/backup-aes256.dpapi'
if args.export_to:
 target=Path(args.export_to).expanduser().resolve()
 if target.exists():raise SystemExit('Refusing to overwrite an existing file.')
 if (ROOT/'Backups').resolve() in target.parents:raise SystemExit('Choose a location separate from the backup directory.')
 if not protected.exists():raise SystemExit('Create a verified backup first.')
 with target.open('x',encoding='ascii') as f:f.write(base64.b64encode(dpapi(protected.read_bytes(),True)).decode())
 print('Recovery key exported. Keep this file offline and separate from backups.')
else:
 key=base64.b64decode(Path(args.import_from).read_text(encoding='ascii').strip(),validate=True)
 if len(key)!=32:raise SystemExit('Invalid recovery key.')
 if protected.exists() and dpapi(protected.read_bytes(),True)!=key:raise SystemExit('A different recovery key already exists; preserve it before importing.')
 protected.parent.mkdir(parents=True,exist_ok=True);protected.write_bytes(dpapi(key));print('Recovery key protected for this Windows account.')
