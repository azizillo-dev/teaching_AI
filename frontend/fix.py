import os
import re

files = [
    "c:/Users/user/Desktop/teaching_AI/frontend/features/assignments/components/AssignmentDialogs.tsx",
    "c:/Users/user/Desktop/teaching_AI/frontend/features/groups/components/GroupDialogs.tsx",
    "c:/Users/user/Desktop/teaching_AI/frontend/features/students/components/StudentDialogs.tsx"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Normalize ModalProps
    content = re.sub(r'onOpenChange:\s*\(open:\s*boolean\)\s*=>\s*void;', 'onClose: () => void;', content)
    content = re.sub(r'function Modal\(\{\s*isOpen,\s*onOpenChange,\s*title,\s*children\s*\}\s*:\s*ModalProps\)', 'function Modal({ isOpen, onClose, title, children }: ModalProps)', content)

    # Normalize usage
    content = re.sub(r'onOpenChange=\{\(open\)\s*=>\s*!open\s*&&\s*onOpenChange\(false\)\}', 'onClose={onClose}', content)
    content = re.sub(r'onOpenChange=\{\(open\)\s*=>\s*!open\s*&&\s*onClose\(\)\}', 'onClose={onClose}', content)
    content = re.sub(r'onSuccess:\s*\(\)\s*=>\s*onOpenChange\(false\),', 'onSuccess: () => onClose(),', content)

    # Normalize component props
    content = re.sub(r'onOpenChange:\s*\(open:\s*boolean\)\s*=>\s*void', 'onClose: () => void', content)
    content = re.sub(r'onOpenChange', 'onClose', content)

    # Fix the duplicate onSuccess in StudentDialogs (line 195)
    content = re.sub(r'onSuccess:\s*\(\)\s*=>\s*onClose\(\),\s*onSuccess:\s*\(\)\s*=>\s*onClose\(\),', 'onSuccess: () => onClose(),', content)

    # Revert duplicate `onClose` in signature (if any)
    content = re.sub(r'\{ isOpen, onClose, onClose \}', '{ isOpen, onClose }', content)
    content = re.sub(r'\{ isOpen, onClose, onClose,', '{ isOpen, onClose,', content)

    with open(file, "w") as f:
        f.write(content)

print("Fixed")
