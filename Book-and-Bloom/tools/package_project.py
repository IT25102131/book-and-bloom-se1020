"""Create a portable project archive, excluding machine-specific and runtime data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib

root = Path(__file__).resolve().parents[1]
output = root / 'output' / 'Book-and-Bloom-SE1020.zip'
folders = ['.mvn', 'src', 'docs', 'tools', 'output/pdf']
files = ['.gitignore', 'README.md', 'pom.xml', 'mvnw', 'mvnw.cmd',
         'start-bookstore.cmd', 'target/book-and-bloom.war']
paths = [root / name for name in files]
for folder in folders:
    paths.extend(path for path in (root / folder).rglob('*') if path.is_file() and '__pycache__' not in path.parts)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(set(paths)):
        archive.write(path, Path('Book-and-Bloom') / path.relative_to(root))
with ZipFile(output) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert 'Book-and-Bloom/target/book-and-bloom.war' in names
    assert 'Book-and-Bloom/src/main/resources/sample-data/bookstore.txt' in names
    assert not any('/data/' in name or '/.git/' in name for name in names)
digest = hashlib.sha256(output.read_bytes()).hexdigest()
(output.with_suffix('.zip.sha256')).write_text(digest + '  ' + output.name + '\n', encoding='utf-8')
print(f'{len(paths)} files | {output.stat().st_size / 1024 / 1024:.1f} MB | archive integrity verified')
print(output)
